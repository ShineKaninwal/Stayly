import re

from email_validator import EmailNotValidError, validate_email

from app.utils.exceptions import ApiError


def _s(value):
    return value if isinstance(value, str) else ""


def validate_password_rules(pw):
    if len(pw) < 8:
        return "Password must be at least 8 characters."
    if len(pw) > 128:
        return "Password must be at most 128 characters."
    if not re.search(r"[a-z]", pw) or not re.search(r"[A-Z]", pw) or not re.search(r"\d", pw):
        return "Password needs an uppercase letter, a lowercase letter and a number."
    return None


def normalize_email(raw):
    try:
        return validate_email(_s(raw).strip(), check_deliverability=False).normalized.lower()
    except EmailNotValidError:
        return None


def validate_signup(data):
    if not isinstance(data, dict):
        raise ApiError("INVALID_REQUEST", "Send a JSON body.", 400)
    errors = {}
    name = " ".join(_s(data.get("name")).split())
    if not 2 <= len(name) <= 100:
        errors["name"] = "Enter your full name (2–100 characters)."
    email = normalize_email(data.get("email"))
    if not email:
        errors["email"] = "Enter a valid email address."
    pw = _s(data.get("password"))
    pw_err = validate_password_rules(pw)
    if pw_err:
        errors["password"] = pw_err
    if _s(data.get("confirm_password")) != pw:
        errors["confirm_password"] = "Passwords don't match."
    if errors:
        raise ApiError("VALIDATION_ERROR", "Please fix the highlighted fields.", 400, errors)
    return name, email, pw


def validate_login(data):
    if not isinstance(data, dict):
        raise ApiError("INVALID_REQUEST", "Send a JSON body.", 400)
    email = _s(data.get("email")).strip().lower()
    pw = _s(data.get("password"))
    if not email or not pw or len(pw) > 128:
        raise ApiError("VALIDATION_ERROR", "Enter your email and password.", 400)
    return email, pw
