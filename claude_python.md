### ✅ Container de Injeção com dependency-injector
```python
# src/shared/container.py
from dependency_injector import containers, providers
from dependency_injector.wiring import Provide, inject

from src.domain.repositories.user_repository import UserRepository
from src.domain.services.email_service import EmailService
from src.infrastructure.persistence.repositories.mongo_user_repository import MongoUserRepository
from src.infrastructure.external.smtp_email_service import SMTPEmailService
from src.application.use_cases.create_user_use_case import CreateUserUseCase
from src.infrastructure.config.database import Database
from src.infrastructure.config.logger import StructuredLogger

class Container(containers.DeclarativeContainer):
    # Configuration
    config = providers.Configuration()
    
    # Infrastructure
    database = providers.Singleton(
        Database,
        connection_string=config.database.url,
        max_connections=config.database.max_connections
    )
    
    logger = providers.Singleton(StructuredLogger)
    
    # Repositories
    user_repository = providers.Factory(
        MongoUserRepository,
        database=database,
        logger=logger
    )
    
    # External Services
    email_service = providers.Factory(
        SMTPEmailService,
        smtp_host=config.email.smtp_host,
        smtp_port=config.email.smtp_port,
        smtp_user=config.email.smtp_user,
        smtp_password=config.email.smtp_password,
        logger=logger
    )
    
    # Use Cases
    create_user_use_case = providers.Factory(
        CreateUserUseCase,
        user_repository=user_repository,
        email_service=email_service,
        logger=logger
    )

# Global container instance
container = Container()
```

### ✅ Interfaces Abstratas (Domain Layer)
```python
# src/domain/repositories/user_repository.py
from abc import ABC, abstractmethod
from typing import Optional, List
from uuid import UUID

from src.domain.entities.user import User, UserStatus

class UserRepository(ABC):
    @abstractmethod
    async def find_by_id(self, user_id: UUID) -> Optional[User]:
        """Find user by ID."""
        pass
    
    @abstractmethod
    async def find_by_email(self, email: str) -> Optional[User]:
        """Find user by email address."""
        pass
    
    @abstractmethod
    async def save(self, user: User) -> User:
        """Save user and return saved instance."""
        pass
    
    @abstractmethod
    async def find_by_status(self, status: UserStatus, limit: int = 100) -> List[User]:
        """Find users by status with optional limit."""
        pass

# src/domain/services/email_service.py
from abc import ABC, abstractmethod

class EmailService(ABC):
    @abstractmethod
    async def send_welcome_email(self, email: str, name: str) -> None:
        """Send welcome email to new user."""
        pass
    
    @abstractmethod
    async def send_password_reset(self, email: str, reset_token: str) -> None:
        """Send password reset email."""
        pass
```

### ✅ Use Case com Injeção de Dependência
```python
# src/application/use_cases/create_user_use_case.py
from typing import Union
import structlog
from uuid import uuid4

from src.domain.entities.user import User, UserStatus
from src.domain.repositories.user_repository import UserRepository
from src.domain.services.email_service import EmailService
from src.application.commands.create_user_command import CreateUserCommand
from src.shared.exceptions import DuplicateEmailError, InternalServerError
from src.shared.result import Result

logger = structlog.get_logger()

class CreateUserUseCase:
    def __init__(
        self,
        user_repository: UserRepository,
        email_service: EmailService,
        logger: structlog.BoundLogger
    ) -> None:
        self._user_repository = user_repository
        self._email_service = email_service
        self._logger = logger

    async def execute(self, command: CreateUserCommand) -> Result[User, Exception]:
        """Create a new user."""
        self._logger.info(
            "Creating user",
            email=command.email,
            name=command.name
        )

        try:
            # Business validation
            existing_user = await self._user_repository.find_by_email(command.email)
            if existing_user:
                error = DuplicateEmailError(command.email)
                self._logger.warning("Email already exists", email=command.email)
                return Result.failure(error)

            # Create entity
            user = User.create(
                name=command.name,
                email=command.email,
                age=command.age
            )

            # Persist
            saved_user = await self._user_repository.save(user)

            # Side effect (async)
            await self._email_service.send_welcome_email(
                saved_user.email, 
                saved_user.name
            )

            self._logger.info(
                "User created successfully",
                user_id=str(saved_user.id),
                email=saved_user.email
            )

            return Result.success(saved_user)

        except Exception as e:
            self._logger.error(
                "Failed to create user",
                email=command.email,
                error=str(e),
                exc_info=True
            )
            return Result.failure(InternalServerError("Failed to create user"))
```

### ❌ Padrão Incorreto - Alto Acoplamento
```python
# NUNCA FAÇA ISSO
import pymongo  # ❌ Import de implementação específica

class UserService:
    def __init__(self):
        # ❌ Dependências concretas hardcoded
        self.db = pymongo.MongoClient("mongodb://localhost")
        self.smtp = smtplib.SMTP("smtp.gmail.com", 587)
    
    def create_user(self, name, email):  # ❌ Sem type hints
        # ❌ Sem validação
        user = {"name": name, "email": email}  # ❌ Dict ao invés de entidade
        
        # ❌ Sem tratamento de erro
        self.db.users.insert_one(user)
        
        # ❌ Sem logging estruturado
        print(f"User created: {email}")  # ❌ print
        
        return user
```

## Entidades com Dataclasses

### ✅ Domain Entity
```python
# src/domain/entities/user.py
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Optional
from uuid import UUID, uuid4

class UserStatus(Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"

@dataclass(frozen=True)  # Imutável
class User:
    id: UUID
    name: str
    email: str
    status: UserStatus
    age: Optional[int]
    created_at: datetime
    updated_at: datetime
    
    @classmethod
    def create(
        cls,
        name: str,
        email: str,
        age: Optional[int] = None,
        status: UserStatus = UserStatus.ACTIVE
    ) -> 'User':
        """Factory method para criar novo usuário."""
        # Validação defensiva
        if not name or len(name.strip()) < 2:
            raise ValueError("Name must be at least 2 characters")
        
        if not email or "@" not in email:
            raise ValueError("Invalid email format")
        
        if age is not None and (age < 0 or age > 150):
            raise ValueError("Age must be between 0 and 150")
        
        now = datetime.utcnow()
        
        return cls(
            id=uuid4(),
            name=name.strip(),
            email=email.lower().strip(),
            status=status,
            age=age,
            created_at=now,
            updated_at=now
        )
    
    def update_name(self, new_name: str) -> 'User':
        """Return new instance with updated name."""
        if not new_name or len(new_name.strip()) < 2:
            raise ValueError("Name must be at least 2 characters")
        
        return dataclasses.replace(
            self,
            name=new_name.strip(),
            updated_at=datetime.utcnow()
        )
    
    def deactivate(self) -> 'User':
        """Return new instance with inactive status."""
        return dataclasses.replace(
            self,
            status=UserStatus.INACTIVE,
            updated_at=datetime.utcnow()
        )
    
    def is_active(self) -> bool:
        """Check if user is active."""
        return self.status == UserStatus.ACTIVE
```

### Value Objects
```python
# src/domain/value_objects/email.py
from dataclasses import dataclass
import re

@dataclass(frozen=True)
class Email:
    value: str
    
    def __post_init__(self) -> None:
        if not self._is_valid(self.value):
            raise ValueError(f"Invalid email format: {self.value}")
    
    @staticmethod
    def _is_valid(email: str) -> bool:
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}# CLAUDE-PYTHON.md - Guia para Python

> **Para Claude Code**: Este documento define padrões específicos para Python. Sempre seguir estas diretrizes junto com CLAUDE.md.

## ⚡ TL;DR para Claude Code (Python)
```
SEMPRE:
✅ Type hints obrigatórios (mypy strict)
✅ Dataclasses/Pydantic para DTOs
✅ Dependency injection com containers
✅ Result pattern ou Optional
✅ Structured logging (structlog)
✅ Pytest para testes + fixtures
✅ Environment com pydantic-settings
✅ FastAPI para APIs REST

NUNCA:
❌ Código sem type hints
❌ Dicts para objetos de negócio
❌ Import direto (use injeção)
❌ Exception genérica sem contexto
❌ print() (use logger)
❌ Hardcoded configs
❌ Tests sem mocks/fixtures
❌ Mutabilidade desnecessária
```

## Estrutura de Projeto Python

```
src/
├── domain/                    # Regras de negócio
│   ├── entities/
│   ├── repositories/          # Interfaces abstratas
│   ├── services/              # Interfaces abstratas  
│   ├── value_objects/
│   └── exceptions/
├── application/               # Casos de uso
│   ├── use_cases/
│   ├── commands/
│   ├── queries/
│   └── handlers/
├── infrastructure/            # Implementações técnicas
│   ├── persistence/
│   │   ├── repositories/
│   │   ├── models/
│   │   └── migrations/
│   ├── external/
│   ├── messaging/
│   └── config/
├── presentation/              # HTTP/API Layer
│   ├── api/
│   │   ├── endpoints/
│   │   ├── dependencies/
│   │   └── middleware/
│   ├── schemas/               # Pydantic models
│   └── mappers/
├── shared/                    # Utilitários compartilhados
│   ├── exceptions/
│   ├── utils/
│   ├── types/
│   └── container.py
└── main.py                   # Entry point

tests/
├── unit/
├── integration/
└── e2e/

config/
├── settings.py
└── logging.py
```

## Zero Acoplamento com Dependency Injection

### ✅ Container de Injeção com
        return bool(re.match(pattern, email))
    
    def domain(self) -> str:
        """Extract domain from email."""
        return self.value.split('@')[1]
    
    def __str__(self) -> str:
        return self.value

# src/domain/value_objects/name.py
from dataclasses import dataclass

@dataclass(frozen=True)
class Name:
    first: str
    last: str
    
    def __post_init__(self) -> None:
        if not self.first.strip() or not self.last.strip():
            raise ValueError("First and last names are required")
        
        if len(self.first) > 50 or len(self.last) > 50:
            raise ValueError("Names must not exceed 50 characters")
    
    @property
    def full(self) -> str:
        return f"{self.first} {self.last}"
    
    @property
    def initials(self) -> str:
        return f"{self.first[0].upper()}{self.last[0].upper()}"
```

## DTOs com Pydantic

### Request/Response Schemas
```python
# src/presentation/schemas/user_schemas.py
from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field, validator

class CreateUserRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="User full name")
    email: EmailStr = Field(..., description="User email address")
    age: Optional[int] = Field(None, ge=0, le=150, description="User age")
    
    @validator('name')
    def validate_name(cls, v: str) -> str:
        if not v.strip():
            raise ValueError('Name cannot be empty')
        return v.strip()
    
    class Config:
        schema_extra = {
            "example": {
                "name": "John Doe",
                "email": "john@example.com",
                "age": 30
            }
        }

class UpdateUserRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    age: Optional[int] = Field(None, ge=0, le=150)
    
    @validator('name')
    def validate_name(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not v.strip():
            raise ValueError('Name cannot be empty')
        return v.strip() if v else None

class UserResponse(BaseModel):
    id: UUID
    name: str
    email: EmailStr
    status: str
    age: Optional[int]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True

class GetUsersQuery(BaseModel):
    page: int = Field(1, ge=1, description="Page number")
    limit: int = Field(20, ge=1, le=100, description="Items per page")
    status: Optional[str] = Field(None, description="Filter by status")
    search: Optional[str] = Field(None, description="Search term")

class PaginatedUsersResponse(BaseModel):
    items: list[UserResponse]
    page: int
    limit: int
    total: int
    total_pages: int
```

### Mappers
```python
# src/presentation/mappers/user_mapper.py
from src.domain.entities.user import User
from src.presentation.schemas.user_schemas import UserResponse, CreateUserRequest
from src.application.commands.create_user_command import CreateUserCommand

class UserMapper:
    @staticmethod
    def to_response(user: User) -> UserResponse:
        """Convert domain entity to response DTO."""
        return UserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            status=user.status.value,
            age=user.age,
            created_at=user.created_at,
            updated_at=user.updated_at
        )
    
    @staticmethod
    def to_command(request: CreateUserRequest) -> CreateUserCommand:
        """Convert request DTO to command."""
        return CreateUserCommand(
            name=request.name,
            email=request.email,
            age=request.age
        )
    
    @staticmethod
    def to_responses(users: list[User]) -> list[UserResponse]:
        """Convert list of entities to list of response DTOs."""
        return [UserMapper.to_response(user) for user in users]
```

## Result Pattern para Error Handling

### Result Type
```python
# src/shared/result.py
from typing import TypeVar, Generic, Union, Callable
from dataclasses import dataclass

T = TypeVar('T')
E = TypeVar('E', bound=Exception)

@dataclass(frozen=True)
class Result(Generic[T, E]):
    _value: Union[T, None]
    _error: Union[E, None]
    _is_success: bool
    
    @classmethod
    def success(cls, value: T) -> 'Result[T, E]':
        """Create a success result."""
        return cls(_value=value, _error=None, _is_success=True)
    
    @classmethod
    def failure(cls, error: E) -> 'Result[T, E]':
        """Create a failure result."""
        return cls(_value=None, _error=error, _is_success=False)
    
    @property
    def is_success(self) -> bool:
        return self._is_success
    
    @property
    def is_failure(self) -> bool:
        return not self._is_success
    
    @property
    def value(self) -> T:
        if not self._is_success:
            raise ValueError("Cannot get value of a failure result")
        return self._value  # type: ignore
    
    @property
    def error(self) -> E:
        if self._is_success:
            raise ValueError("Cannot get error of a success result")
        return self._error  # type: ignore
    
    def map(self, func: Callable[[T], U]) -> 'Result[U, E]':
        """Map the value if success, otherwise return the error."""
        if self._is_success:
            return Result.success(func(self._value))  # type: ignore
        return Result.failure(self._error)  # type: ignore
    
    def bind(self, func: Callable[[T], 'Result[U, E]']) -> 'Result[U, E]':
        """Bind operation for chaining Results."""
        if self._is_success:
            return func(self._value)  # type: ignore
        return Result.failure(self._error)  # type: ignore
    
    def match(self, on_success: Callable[[T], U], on_failure: Callable[[E], U]) -> U:
        """Pattern matching for Result."""
        if self._is_success:
            return on_success(self._value)  # type: ignore
        return on_failure(self._error)  # type: ignore
```

### Custom Exception Hierarchy
```python
# src/shared/exceptions.py
from typing import Optional, Dict, Any

class BaseException(Exception):
    """Base exception for all custom exceptions."""
    
    def __init__(
        self, 
        message: str, 
        code: str,
        status_code: int = 500,
        context: Optional[Dict[str, Any]] = None
    ) -> None:
        super().__init__(message)
        self.message = message
        self.code = code
        self.status_code = status_code
        self.context = context or {}

class DomainException(BaseException):
    """Base for domain-specific exceptions."""
    pass

class InfrastructureException(BaseException):
    """Base for infrastructure-specific exceptions."""
    pass

# Domain Exceptions
class DuplicateEmailError(DomainException):
    def __init__(self, email: str) -> None:
        super().__init__(
            message=f"Email already exists: {email}",
            code="DUPLICATE_EMAIL",
            status_code=409,
            context={"email": email}
        )

class UserNotFoundError(DomainException):
    def __init__(self, user_id: str) -> None:
        super().__init__(
            message=f"User not found: {user_id}",
            code="USER_NOT_FOUND",
            status_code=404,
            context={"user_id": user_id}
        )

class InvalidEmailError(DomainException):
    def __init__(self, email: str) -> None:
        super().__init__(
            message=f"Invalid email format: {email}",
            code="INVALID_EMAIL",
            status_code=400,
            context={"email": email}
        )

# Infrastructure Exceptions
class DatabaseConnectionError(InfrastructureException):
    def __init__(self, original_error: Exception) -> None:
        super().__init__(
            message="Database connection failed",
            code="DATABASE_CONNECTION_ERROR",
            status_code=503,
            context={"original_error": str(original_error)}
        )

class ExternalServiceError(InfrastructureException):
    def __init__(self, service: str, original_error: Exception) -> None:
        super().__init__(
            message=f"External service error: {service}",
            code="EXTERNAL_SERVICE_ERROR",
            status_code=502,
            context={
                "service": service,
                "original_error": str(original_error)
            }
        )
```

## FastAPI Controllers

### ✅ Controller com Error Handling
```python
# src/presentation/api/endpoints/users.py
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from dependency_injector.wiring import inject, Provide
import structlog

from src.shared.container import Container
from src.application.use_cases.create_user_use_case import CreateUserUseCase
from src.application.use_cases.get_user_use_case import GetUserUseCase
from src.presentation.schemas.user_schemas import (
    CreateUserRequest,
    UserResponse,
    GetUsersQuery,
    PaginatedUsersResponse
)
from src.presentation.mappers.user_mapper import UserMapper
from src.shared.exceptions import BaseException

router = APIRouter(prefix="/users", tags=["users"])
logger = structlog.get_logger()

@router.post(
    "/",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new user",
    description="Create a new user with the provided information"
)
@inject
async def create_user(
    request: CreateUserRequest,
    use_case: CreateUserUseCase = Depends(Provide[Container.create_user_use_case])
) -> UserResponse:
    """Create a new user."""
    logger.info("Creating user via API", email=request.email)
    
    command = UserMapper.to_command(request)
    result = await use_case.execute(command)
    
    return result.match(
        on_success=lambda user: UserMapper.to_response(user),
        on_failure=lambda error: _handle_error(error)
    )

@router.get(
    "/{user_id}",
    response_model=UserResponse,
    summary="Get user by ID",
    description="Retrieve a user by their unique identifier"
)
@inject
async def get_user_by_id(
    user_id: UUID,
    use_case: GetUserUseCase = Depends(Provide[Container.get_user_use_case])
) -> UserResponse:
    """Get user by ID."""
    result = await use_case.execute(str(user_id))
    
    return result.match(
        on_success=lambda user: UserMapper.to_response(user),
        on_failure=lambda error: _handle_error(error)
    )

@router.get(
    "/",
    response_model=PaginatedUsersResponse,
    summary="Get users with pagination",
    description="Retrieve a paginated list of users with optional filtering"
)
@inject
async def get_users(
    query: GetUsersQuery = Depends(),
    use_case: GetUsersUseCase = Depends(Provide[Container.get_users_use_case])
) -> PaginatedUsersResponse:
    """Get users with pagination."""
    result = await use_case.execute(query)
    
    return result.match(
        on_success=lambda paginated: PaginatedUsersResponse(
            items=UserMapper.to_responses(paginated.items),
            page=paginated.page,
            limit=paginated.limit,
            total=paginated.total,
            total_pages=paginated.total_pages
        ),
        on_failure=lambda error: _handle_error(error)
    )

def _handle_error(error: Exception) -> None:
    """Handle errors and convert to HTTP exceptions."""
    if isinstance(error, BaseException):
        logger.warning(
            "Business error in API",
            error_code=error.code,
            error_message=error.message,
            context=error.context
        )
        raise HTTPException(
            status_code=error.status_code,
            detail={
                "code": error.code,
                "message": error.message,
                "context": error.context
            }
        )
    else:
        logger.error("Unexpected error in API", error=str(error), exc_info=True)
        raise HTTPException(
            status_code=500,
            detail={
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred"
            }
        )
```

## Configuração com Pydantic Settings

### Settings Configuration
```python
# src/infrastructure/config/settings.py
from typing import Optional
from pydantic import BaseSettings, PostgresDsn, validator

class DatabaseSettings(BaseSettings):
    url: PostgresDsn
    max_connections: int = 10
    echo: bool = False
    
    class Config:
        env_prefix = "DATABASE_"

class EmailSettings(BaseSettings):
    smtp_host: str
    smtp_port: int = 587
    smtp_user: str
    smtp_password: str
    from_email: str
    use_tls: bool = True
    
    class Config:
        env_prefix = "EMAIL_"

class LoggingSettings(BaseSettings):
    level: str = "INFO"
    format: str = "json"
    
    class Config:
        env_prefix = "LOGGING_"

class Settings(BaseSettings):
    # Application
    app_name: str = "User Service"
    version: str = "1.0.0"
    debug: bool = False
    
    # Security
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # External APIs
    external_api_url: str
    external_api_key: str
    
    # Nested configurations
    database: DatabaseSettings
    email: EmailSettings
    logging: LoggingSettings
    
    @validator('secret_key')
    def validate_secret_key(cls, v: str) -> str:
        if len(v) < 32:
            raise ValueError('Secret key must be at least 32 characters')
        return v
    
    class Config:
        env_file = ".env"
        env_nested_delimiter = "__"
        case_sensitive = False

# Global settings instance
settings = Settings(
    database=DatabaseSettings(),
    email=EmailSettings(),
    logging=LoggingSettings()
)
```

## Logging Estruturado

### Structured Logging
```python
# src/infrastructure/config/logger.py
import structlog
import logging.config
from typing import Any, Dict

def configure_logging(level: str = "INFO", format_type: str = "json") -> None:
    """Configure structured logging."""
    
    timestamper = structlog.processors.TimeStamper(fmt="iso")
    
    processors = [
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        timestamper,
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
    ]
    
    if format_type == "json":
        processors.append(structlog.processors.JSONRenderer())
    else:
        processors.append(structlog.dev.ConsoleRenderer(colors=True))
    
    structlog.configure(
        processors=processors,
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )
    
    # Configure standard logging
    logging.config.dictConfig({
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "plain": {
                "()": structlog.stdlib.ProcessorFormatter,
                "processor": structlog.dev.ConsoleRenderer(colors=True),
            },
            "json": {
                "()": structlog.stdlib.ProcessorFormatter,
                "processor": structlog.processors.JSONRenderer(),
            },
        },
        "handlers": {
            "default": {
                "level": level,
                "class": "logging.StreamHandler",
                "formatter": format_type,
            },
        },
        "loggers": {
            "": {
                "handlers": ["default"],
                "level": level,
                "propagate": True,
            }
        }
    })

class StructuredLogger:
    """Wrapper for structured logger."""
    
    def __init__(self) -> None:
        self._logger = structlog.get_logger()
    
    def info(self, message: str, **kwargs: Any) -> None:
        self._logger.info(message, **kwargs)
    
    def error(self, message: str, error: Exception = None, **kwargs: Any) -> None:
        if error:
            kwargs.update({
                "error": str(error),
                "error_type": type(error).__name__
            })
        self._logger.error(message, **kwargs)
    
    def warning(self, message: str, **kwargs: Any) -> None:
        self._logger.warning(message, **kwargs)
    
    def debug(self, message: str, **kwargs: Any) -> None:
        self._logger.debug(message, **kwargs)
```

## Testes Robustos com Pytest

### Unit Tests
```python
# tests/unit/use_cases/test_create_user_use_case.py
import pytest
from unittest.mock import AsyncMock, Mock
from uuid import uuid4

from src.application.use_cases.create_user_use_case import CreateUserUseCase
from src.application.commands.create_user_command import CreateUserCommand
from src.domain.entities.user import User, UserStatus
from src.shared.exceptions import DuplicateEmailError

@pytest.fixture
def mock_user_repository():
    return AsyncMock()

@pytest.fixture
def mock_email_service():
    return AsyncMock()

@pytest.fixture
def mock_logger():
    return Mock()

@pytest.fixture
def create_user_use_case(mock_user_repository, mock_email_service, mock_logger):
    return CreateUserUseCase(
        user_repository=mock_user_repository,
        email_service=mock_email_service,
        logger=mock_logger
    )

@pytest.mark.asyncio
class TestCreateUserUseCase:
    async def test_execute_success_when_email_is_unique(
        self,
        create_user_use_case,
        mock_user_repository,
        mock_email_service
    ):
        # Arrange
        command = CreateUserCommand(
            name="John Doe",
            email="john@example.com",
            age=30
        )
        
        expected_user = User.create(
            name="John Doe",
            email="john@example.com",
            age=30
        )
        
        mock_user_repository.find_by_email.return_value = None
        mock_user_repository.save.return_value = expected_user
        mock_email_service.send_welcome_email.return_value = None
        
        # Act
        result = await create_user_use_case.execute(command)
        
        # Assert
        assert result.is_failure
        assert "Failed to create user" in str(result.error)
        
        mock_logger.error.assert_called_once()
```

### Integration Tests
```python
# tests/integration/test_user_api.py
import pytest
from httpx import AsyncClient
from fastapi import status
import asyncio

from src.main import app
from src.shared.container import container
from tests.fixtures.database import clean_database

@pytest.fixture
async def client():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

@pytest.fixture(autouse=True)
async def setup_database():
    """Setup and cleanup database for each test."""
    await clean_database()
    yield
    await clean_database()

@pytest.mark.asyncio
class TestUserAPI:
    async def test_create_user_success_with_valid_data(self, client: AsyncClient):
        # Arrange
        user_data = {
            "name": "John Doe",
            "email": "john@example.com",
            "age": 30
        }
        
        # Act
        response = await client.post("/api/users", json=user_data)
        
        # Assert
        assert response.status_code == status.HTTP_201_CREATED
        
        data = response.json()
        assert data["name"] == "John Doe"
        assert data["email"] == "john@example.com"
        assert data["age"] == 30
        assert data["status"] == "active"
        assert "id" in data
        assert "created_at" in data
    
    async def test_create_user_validation_error_invalid_email(self, client: AsyncClient):
        # Arrange
        user_data = {
            "name": "John Doe",
            "email": "invalid-email",
            "age": 30
        }
        
        # Act
        response = await client.post("/api/users", json=user_data)
        
        # Assert
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        
        data = response.json()
        assert "detail" in data
        assert any("email" in error["loc"] for error in data["detail"])
    
    async def test_create_user_conflict_duplicate_email(self, client: AsyncClient):
        # Arrange
        user_data = {
            "name": "John Doe",
            "email": "john@example.com",
            "age": 30
        }
        
        # Create first user
        await client.post("/api/users", json=user_data)
        
        # Try to create user with same email
        duplicate_data = {
            "name": "Jane Doe",
            "email": "john@example.com",
            "age": 25
        }
        
        # Act
        response = await client.post("/api/users", json=duplicate_data)
        
        # Assert
        assert response.status_code == status.HTTP_409_CONFLICT
        
        data = response.json()
        assert data["detail"]["code"] == "DUPLICATE_EMAIL"
    
    async def test_get_user_by_id_success(self, client: AsyncClient):
        # Arrange - Create user first
        user_data = {
            "name": "John Doe",
            "email": "john@example.com",
            "age": 30
        }
        
        create_response = await client.post("/api/users", json=user_data)
        user_id = create_response.json()["id"]
        
        # Act
        response = await client.get(f"/api/users/{user_id}")
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        
        data = response.json()
        assert data["id"] == user_id
        assert data["name"] == "John Doe"
        assert data["email"] == "john@example.com"
    
    async def test_get_user_by_id_not_found(self, client: AsyncClient):
        # Arrange
        non_existent_id = "550e8400-e29b-41d4-a716-446655440000"
        
        # Act
        response = await client.get(f"/api/users/{non_existent_id}")
        
        # Assert
        assert response.status_code == status.HTTP_404_NOT_FOUND
        
        data = response.json()
        assert data["detail"]["code"] == "USER_NOT_FOUND"
    
    async def test_get_users_pagination(self, client: AsyncClient):
        # Arrange - Create multiple users
        users_data = [
            {"name": f"User {i}", "email": f"user{i}@example.com", "age": 20 + i}
            for i in range(5)
        ]
        
        for user_data in users_data:
            await client.post("/api/users", json=user_data)
        
        # Act
        response = await client.get("/api/users?page=1&limit=3")
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        
        data = response.json()
        assert len(data["items"]) == 3
        assert data["page"] == 1
        assert data["limit"] == 3
        assert data["total"] == 5
        assert data["total_pages"] == 2
```

### Repository Tests with Test Database
```python
# tests/integration/repositories/test_user_repository.py
import pytest
from uuid import uuid4

from src.infrastructure.persistence.repositories.mongo_user_repository import MongoUserRepository
from src.domain.entities.user import User, UserStatus
from tests.fixtures.database import test_database

@pytest.fixture
async def user_repository(test_database):
    return MongoUserRepository(database=test_database, logger=Mock())

@pytest.mark.asyncio
class TestUserRepository:
    async def test_save_and_find_by_id(self, user_repository):
        # Arrange
        user = User.create(
            name="John Doe",
            email="john@example.com",
            age=30
        )
        
        # Act
        saved_user = await user_repository.save(user)
        found_user = await user_repository.find_by_id(saved_user.id)
        
        # Assert
        assert found_user is not None
        assert found_user.id == saved_user.id
        assert found_user.name == "John Doe"
        assert found_user.email == "john@example.com"
        assert found_user.age == 30
    
    async def test_find_by_email(self, user_repository):
        # Arrange
        user = User.create(
            name="John Doe",
            email="john@example.com"
        )
        await user_repository.save(user)
        
        # Act
        found_user = await user_repository.find_by_email("john@example.com")
        
        # Assert
        assert found_user is not None
        assert found_user.email == "john@example.com"
        assert found_user.name == "John Doe"
    
    async def test_find_by_email_not_found(self, user_repository):
        # Act
        found_user = await user_repository.find_by_email("nonexistent@example.com")
        
        # Assert
        assert found_user is None
    
    async def test_find_by_status(self, user_repository):
        # Arrange
        active_user = User.create(name="Active User", email="active@example.com")
        inactive_user = User.create(name="Inactive User", email="inactive@example.com")
        inactive_user = inactive_user.deactivate()
        
        await user_repository.save(active_user)
        await user_repository.save(inactive_user)
        
        # Act
        active_users = await user_repository.find_by_status(UserStatus.ACTIVE)
        inactive_users = await user_repository.find_by_status(UserStatus.INACTIVE)
        
        # Assert
        assert len(active_users) == 1
        assert active_users[0].status == UserStatus.ACTIVE
        
        assert len(inactive_users) == 1
        assert inactive_users[0].status == UserStatus.INACTIVE
```

## 🤖 INSTRUÇÕES PARA CLAUDE CODE

### Template de Contexto Python
```markdown
PROJETO: [nome-do-projeto]
STACK: Python 3.11+ + FastAPI + PostgreSQL/MongoDB
PADRÕES: CLAUDE.md + CLAUDE-PYTHON.md obrigatório
DI: dependency-injector container
VALIDAÇÃO: Pydantic schemas + validation
ERROR HANDLING: Result pattern + custom exceptions
LOGS: structlog estruturado
TESTES: pytest + fixtures + asyncio
TIPAGEM: mypy strict mode
ORM: SQLAlchemy/Motor/MongoDB
```

### Prompts Específicos para Python

**Para APIs FastAPI:**
```
"Crie endpoint [funcionalidade] seguindo CLAUDE-PYTHON.md:

OBRIGATÓRIO:
- Router com dependency injection
- Pydantic schemas para request/response
- Result pattern com match para error handling
- Custom exceptions com status codes
- Structured logging com contexto
- Type hints completos
- Testes integration com AsyncClient

ENDPOINT: [especificação]
VALIDAÇÕES: [regras]"
```

**Para Use Cases:**
```
"Crie use case [nome] seguindo CLAUDE-PYTHON.md:

OBRIGATÓRIO:
- Constructor injection com interfaces
- Result pattern para retornos
- Custom exceptions específicas
- Structured logging com contexto
- Type hints completos (mypy strict)
- Testes unitários com pytest + mocks
- Validação defensiva

RESPONSABILIDADES: [lista]
DEPENDÊNCIAS: [repositories/services]"
```

**Para Entidades Domain:**
```
"Crie entidade [nome] seguindo CLAUDE-PYTHON.md:

OBRIGATÓRIO:
- @dataclass(frozen=True) para imutabilidade
- Factory methods (.create()) com validação
- Value objects para campos complexos
- Métodos que retornam novas instâncias
- Type hints completos
- Validação defensiva no constructor
- Testes unitários completos

CAMPOS: [lista-de-campos]
REGRAS DE NEGÓCIO: [validações]"
```

**Para Repositórios:**
```
"Implemente repository [nome] seguindo CLAUDE-PYTHON.md:

OBRIGATÓRIO:
- Interface abstrata no domain
- Implementação na infrastructure
- async/await para operações I/O
- Type hints completos
- Custom exceptions para erros
- Structured logging
- Testes integration com database real

ENTIDADE: [especificação]
OPERAÇÕES: [CRUD específicas]"
```

### Checklist Python
```markdown
□ Type Hints: mypy strict mode sem erros?
□ DI: dependency-injector configurado?
□ DTOs: Pydantic schemas com validação?
□ Entidades: @dataclass(frozen=True) imutáveis?
□ Errors: Result pattern + custom exceptions?
□ Logs: structlog com contexto estruturado?
□ Config: Pydantic Settings com env vars?
□ Testes: pytest + fixtures + coverage >80%?
□ Async: async/await para I/O operations?
□ Performance: Connection pooling + optimizations?
```

---

## Conclusão Python

Este guia garante código Python de alta qualidade com:

1. **Zero acoplamento** via dependency injection
2. **Type safety** com mypy strict mode
3. **Imutabilidade** com dataclasses frozen
4. **Robustez** com Result pattern e custom exceptions
5. **Validação** defensiva com Pydantic
6. **Observabilidade** com structured logging
7. **Testabilidade** com pytest e fixtures

Sempre referencie este documento junto com CLAUDE.md principal para desenvolvimento Python!is_success
        assert result.value.name == "John Doe"
        assert result.value.email == "john@example.com"
        assert result.value.age == 30
        
        mock_user_repository.find_by_email.assert_called_once_with("john@example.com")
        mock_user_repository.save.assert_called_once()
        mock_email_service.send_welcome_email.assert_called_once_with(
            "john@example.com", "John Doe"
        )
    
    async def test_execute_failure_when_email_already_exists(
        self,
        create_user_use_case,
        mock_user_repository,
        mock_email_service
    ):
        # Arrange
        command = CreateUserCommand(
            name="John Doe",
            email="john@example.com",
            age=30
        )
        
        existing_user = User.create(
            name="Existing User",
            email="john@example.com"
        )
        
        mock_user_repository.find_by_email.return_value = existing_user
        
        # Act
        result = await create_user_use_case.execute(command)
        
        # Assert
        assert result.is_failure
        assert isinstance(result.error, DuplicateEmailError)
        assert "john@example.com" in str(result.error)
        
        mock_user_repository.save.assert_not_called()
        mock_email_service.send_welcome_email.assert_not_called()
    
    async def test_execute_handles_unexpected_errors(
        self,
        create_user_use_case,
        mock_user_repository,
        mock_logger
    ):
        # Arrange
        command = CreateUserCommand(
            name="John Doe",
            email="john@example.com",
            age=30
        )
        
        mock_user_repository.find_by_email.side_effect = Exception("Database error")
        
        # Act
        result = await create_user_use_case.execute(command)
        
        # Assert
        assert result.# CLAUDE-PYTHON.md - Guia para Python

> **Para Claude Code**: Este documento define padrões específicos para Python. Sempre seguir estas diretrizes junto com CLAUDE.md.

## ⚡ TL;DR para Claude Code (Python)
```
SEMPRE:
✅ Type hints obrigatórios (mypy strict)
✅ Dataclasses/Pydantic para DTOs
✅ Dependency injection com containers
✅ Result pattern ou Optional
✅ Structured logging (structlog)
✅ Pytest para testes + fixtures
✅ Environment com pydantic-settings
✅ FastAPI para APIs REST

NUNCA:
❌ Código sem type hints
❌ Dicts para objetos de negócio
❌ Import direto (use injeção)
❌ Exception genérica sem contexto
❌ print() (use logger)
❌ Hardcoded configs
❌ Tests sem mocks/fixtures
❌ Mutabilidade desnecessária
```

## Estrutura de Projeto Python

```
src/
├── domain/                    # Regras de negócio
│   ├── entities/
│   ├── repositories/          # Interfaces abstratas
│   ├── services/              # Interfaces abstratas  
│   ├── value_objects/
│   └── exceptions/
├── application/               # Casos de uso
│   ├── use_cases/
│   ├── commands/
│   ├── queries/
│   └── handlers/
├── infrastructure/            # Implementações técnicas
│   ├── persistence/
│   │   ├── repositories/
│   │   ├── models/
│   │   └── migrations/
│   ├── external/
│   ├── messaging/
│   └── config/
├── presentation/              # HTTP/API Layer
│   ├── api/
│   │   ├── endpoints/
│   │   ├── dependencies/
│   │   └── middleware/
│   ├── schemas/               # Pydantic models
│   └── mappers/
├── shared/                    # Utilitários compartilhados
│   ├── exceptions/
│   ├── utils/
│   ├── types/
│   └── container.py
└── main.py                   # Entry point

tests/
├── unit/
├── integration/
└── e2e/

config/
├── settings.py
└── logging.py
```

## Zero Acoplamento com Dependency Injection

### ✅ Container de Injeção com