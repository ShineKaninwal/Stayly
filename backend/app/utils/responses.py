from flask import jsonify


def success(data=None, status=200):
    return jsonify({"success": True, "data": data}), status


def error(code, message, status=400, details=None):
    body = {"code": code, "message": message}
    if details:
        body["details"] = details
    return jsonify({"success": False, "error": body}), status
