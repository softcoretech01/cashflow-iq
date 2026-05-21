from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import os
import pandas as pd
from app.services.file_service import FileService

bp = Blueprint('files', __name__, url_prefix='/api/files')

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), '../../uploads')
ALLOWED_EXTENSIONS = {'xlsx', 'xls'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@bp.route('/upload', methods=['POST'])
def upload_file():
    """Upload and process Excel file"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'Only .xlsx and .xls files are allowed'}), 400
    
    try:
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        filename = secure_filename(file.filename)
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)
        
        # Get column mapping if provided
        column_mapping = None
        if 'columnMapping' in request.form:
            import json
            column_mapping = json.loads(request.form['columnMapping'])
        
        # Process file
        result = FileService.process_uploaded_file(file_path, file.filename, column_mapping)
        
        if result['success']:
            return jsonify(result), 201
        else:
            return jsonify(result), 400
    
    except Exception as e:
        return jsonify({'error': str(e), 'message': 'File upload failed'}), 500

@bp.route('/list', methods=['GET'])
def list_files():
    """Get list of uploaded files"""
    try:
        files = FileService.get_uploaded_files()
        return jsonify({'files': files}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/<int:file_id>', methods=['DELETE'])
def delete_file(file_id):
    """Delete uploaded file"""
    try:
        from app.models.file_upload import FileUpload
        from app import db
        
        file_record = FileUpload.query.get(file_id)
        if not file_record:
            return jsonify({'error': 'File not found'}), 404
        
        # Delete related payments
        from app.models.payment import Payment
        Payment.query.filter_by(file_upload_id=file_id).delete()
        
        # Delete file record
        db.session.delete(file_record)
        db.session.commit()
        
        # Delete actual file
        if os.path.exists(file_record.file_path):
            os.remove(file_record.file_path)
        
        return jsonify({'message': 'File deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/preview', methods=['POST'])
def preview_file():
    """Preview Excel file before processing"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if not allowed_file(file.filename):
        return jsonify({'error': 'Only .xlsx and .xls files are allowed'}), 400
    
    try:
        from app.services.excel_processor import ExcelProcessor
        import io
        
        file_content = io.BytesIO(file.read())
        df = ExcelProcessor.read_excel(file_content)
        
        # Detect columns
        detected_columns = ExcelProcessor.detect_columns(df)
        
        # Replace NaN with None for valid JSON serialization
        preview_df = df.head(5).where(pd.notnull(df.head(5)), None)
        
        # Return preview data
        return jsonify({
            'columns': list(df.columns),
            'detected_mapping': detected_columns,
            'sample_rows': preview_df.to_dict('records'),
            'total_rows': len(df)
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e), 'message': 'Failed to preview file'}), 400
