from app import mongo
from bson import ObjectId
from werkzeug.exceptions import NotFound
from io import BytesIO

def save_file(file):
    if file.filename == '':
        return None
    file_id = mongo.save_file(file.filename, file)
    return str(file_id)

def get_file(file_id):
    try:
        file_data = mongo.db.fs.files.find_one({'_id': ObjectId(file_id)})
        if file_data:
            chunks = mongo.db.fs.chunks.find({'files_id': ObjectId(file_id)}).sort('n')
            file_content = b''
            for chunk in chunks:
                file_content += chunk['data']
            return BytesIO(file_content)
        raise NotFound('File not found')
    except Exception as e:
        raise NotFound('File not found')