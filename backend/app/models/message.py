from datetime import datetime, timedelta
from bson import ObjectId

class Message:
    def __init__(self, content, file_id=None, expiration_hours=24, title=None, max_views=None, password=None, public_paste=False):
        self.content = content
        self.file_id = file_id
        self.expiration_time = datetime.utcnow() + timedelta(hours=expiration_hours)
        self.created_at = datetime.utcnow()
        self.url_hash = None
        self.title = title
        self.lifetime = expiration_hours
        self.max_views = max_views
        self.password = password
        self.public_paste = public_paste
        self.view_count = 0

    def to_dict(self):
        return {
            'content': self.content,
            'file_id': self.file_id,
            'expiration_time': self.expiration_time,
            'created_at': self.created_at,
            'url_hash': self.url_hash,
            'title': self.title,
            'lifetime': self.lifetime,
            'max_views': self.max_views,
            'password': self.password,
            'public_paste': self.public_paste,
            'view_count': self.view_count
        }

    @staticmethod
    def from_dict(data):
        message = Message(
            data['content'],
            data['file_id'],
            (data['expiration_time'] - data['created_at']).total_seconds() / 3600,
            data['title'],
            data['max_views'],
            data['password'],
            data['public_paste']
        )
        message.expiration_time = data['expiration_time']
        message.created_at = data['created_at']
        message.url_hash = data['url_hash']
        message.view_count = data.get('view_count', 0)
        return message

    def is_expired(self):
        return datetime.utcnow() > self.expiration_time or (self.max_views and self.view_count >= self.max_views)

    def increment_view_count(self):
        self.view_count += 1