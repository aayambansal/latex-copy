# InkVell - Production Dockerfile for Railway
# Based on Overleaf Community Edition

FROM sharelatex/sharelatex:latest

# Set InkVell branding and defaults
# Note: OVERLEAF_MONGO_URL and REDIS vars should be set via Railway env vars
ENV OVERLEAF_APP_NAME=InkVell \
    OVERLEAF_ALLOW_PUBLIC_ACCESS=true \
    EMAIL_CONFIRMATION_DISABLED=true \
    ENABLED_LINKED_FILE_TYPES=project_file,project_output_file \
    ENABLE_CONVERSIONS=true \
    OVERLEAF_BEHIND_PROXY=true \
    OVERLEAF_SECURE_COOKIE=false \
    ALLOW_MONGO_ADMIN_CHECK_FAILURES=true

# Copy custom branding files
COPY overleaf/services/web/public/img/brand/ /overleaf/services/web/public/img/brand/
COPY logo.png /overleaf/services/web/public/img/brand/inkvell-logo.png
COPY overleaf/services/web/public/favicon.svg /overleaf/services/web/public/favicon.svg
COPY overleaf/services/web/public/mask-favicon.svg /overleaf/services/web/public/mask-favicon.svg
COPY overleaf/services/web/public/web.sitemanifest /overleaf/services/web/public/web.sitemanifest

# Patch MongoDB check script to handle Atlas free tier errors
RUN sed -i "s/err.codeName === 'Unauthorized'/err.codeName === 'Unauthorized' || err.codeName === 'AtlasError'/g" /overleaf/services/web/modules/server-ce-scripts/scripts/check-mongodb.mjs

# Expose port 80 (Railway handles port mapping)
EXPOSE 80

# Increase healthcheck timeout for cold starts
HEALTHCHECK --interval=30s --timeout=30s --start-period=300s --retries=10 \
    CMD curl -f http://localhost/health_check || exit 1

