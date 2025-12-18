# InkVell - Production Dockerfile for Railway
# Based on Overleaf Community Edition

FROM sharelatex/sharelatex:latest

# Set InkVell branding
ENV OVERLEAF_APP_NAME=InkVell \
    OVERLEAF_ALLOW_PUBLIC_ACCESS=true \
    EMAIL_CONFIRMATION_DISABLED=true \
    ENABLED_LINKED_FILE_TYPES=project_file,project_output_file \
    ENABLE_CONVERSIONS=true

# Copy custom branding files
COPY overleaf/services/web/public/img/brand/ /overleaf/services/web/public/img/brand/
COPY logo.png /overleaf/services/web/public/img/brand/inkvell-logo.png
COPY overleaf/services/web/public/favicon.svg /overleaf/services/web/public/favicon.svg
COPY overleaf/services/web/public/mask-favicon.svg /overleaf/services/web/public/mask-favicon.svg
COPY overleaf/services/web/public/web.sitemanifest /overleaf/services/web/public/web.sitemanifest

# Note: For full custom styling, the frontend needs to be rebuilt
# The sharelatex/sharelatex image includes pre-built assets

# Expose port (Railway will use PORT env var)
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost/health_check || exit 1

