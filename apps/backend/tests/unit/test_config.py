from src.config import Settings


def test_cors_origins_include_localhost_and_loopback_variants():
    settings = Settings(
        cors_origins_str="http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000"
    )

    assert settings.cors_origins == [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]
