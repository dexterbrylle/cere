from flask import Blueprint, request, jsonify, send_file
from app.models.message import Message
from app.utils.encryption import encrypt_message, decrypt_message
from app.utils.file_handler import save_file, get_file
from app import mongo
import secrets
from bson import ObjectId
from werkzeug.exceptions import BadRequest, NotFound

bp = Blueprint('messages', __name__)

@bp.route('/api/messages', methods=['POST'])
def create_message():
    try:
        content = request.form.get('content')
        title = request.form.get('title')
        expiration_hours = int(request.form.get('expiration_hours', 24))
        max_views = int(request.form.get('max_views')) if request.form.get('max_views') else None
        password = request.form.get('password')
        public_paste = request.form.get('public_paste') == 'true'
        file = request.files.get('file')

        if not content:
            raise BadRequest('Content is required')

        encrypted_content = encrypt_message(content)
        url_hash = secrets.token_urlsafe(16)

        file_id = None
        if file:
            file_id = save_file(file)

        message = Message(encrypted_content, file_id, expiration_hours, title, max_views, password, public_paste)
        message.url_hash = url_hash

        mongo.db.messages.insert_one(message.to_dict())

        return jsonify({'url': f'/messages/{url_hash}'}), 201
    except BadRequest as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'An unexpected error occurred'}), 500

@bp.route('/api/messages/<url_hash>', methods=['GET'])
def get_message(url_hash):
    try:
        message_data = mongo.db.messages.find_one({'url_hash': url_hash})

        if not message_data:
            raise NotFound('Message not found')

        message = Message.from_dict(message_data)

        if message.is_expired():
            mongo.db.messages.delete_one({'_id': message_data['_id']})
            if message.file_id:
                mongo.db.fs.files.delete_one({'_id': ObjectId(message.file_id)})
                mongo.db.fs.chunks.delete_many({'files_id': ObjectId(message.file_id)})
            raise NotFound('Message has expired')

        if message.password and request.headers.get('X-Password') != message.password:
            return jsonify({'error': 'Password required'}), 403

        message.increment_view_count()
        mongo.db.messages.update_one({'_id': message_data['_id']}, {'$set': {'view_count': message.view_count}})

        decrypted_content = decrypt_message(message.content)
        response = {
            'content': decrypted_content,
            'expiration_time': message.expiration_time.isoformat(),
            'title': message.title,
            'public_paste': message.public_paste,
            'view_count': message.view_count,
            'max_views': message.max_views
        }

        if message.file_id:
            response['file_url'] = f'/api/messages/{url_hash}/file'

        return jsonify(response)
    except NotFound as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        return jsonify({'error': 'An unexpected error occurred'}), 500

@bp.route('/api/messages/<url_hash>/file', methods=['GET'])
def get_message_file(url_hash):
    try:
        message_data = mongo.db.messages.find_one({'url_hash': url_hash})

        if not message_data or not message_data['file_id']:
            raise NotFound('File not found')

        message = Message.from_dict(message_data)

        if message.is_expired():
            raise NotFound('Message has expired')

        file_data = get_file(message.file_id)
        return send_file(file_data, download_name=file_data.filename, as_attachment=True)
    except NotFound as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        return jsonify({'error': 'An unexpected error occurred'}), 500