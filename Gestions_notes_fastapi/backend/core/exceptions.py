from fastapi import HTTPException, status

class NotesException(Exception):
    pass

class AuthenticationException(NotesException):
    pass

class AuthorizationException(NotesException):
    pass

class ValidationException(NotesException):
    pass

class NotFoundException(NotesException):
    pass

credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)

forbidden_exception = HTTPException(
    status_code=status.HTTP_403_FORBIDDEN,
    detail="Operation not permitted"
)

not_found_exception = HTTPException(
    status_code=status.HTTP_404_NOT_FOUND,
    detail="Resource not found"
)

validation_exception = HTTPException(
    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
    detail="Validation error"
)


  