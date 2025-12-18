# InkVell - Production Dockerfile for Railway
# Based on Overleaf Community Edition

FROM sharelatex/sharelatex:latest

# Set InkVell branding and defaults
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

# Skip the MongoDB database check entirely for Atlas compatibility
RUN echo '#!/bin/bash\necho "Skipping MongoDB check for Atlas compatibility"\nexit 0' > /etc/my_init.d/500_check_db_access.sh && \
    chmod +x /etc/my_init.d/500_check_db_access.sh

# Skip migrations check for fresh deployment (no existing projects to migrate)
RUN echo '#!/bin/bash\necho "Skipping migrations for fresh InkVell deployment"\nexit 0' > /etc/my_init.d/900_run_web_migrations.sh && \
    chmod +x /etc/my_init.d/900_run_web_migrations.sh

# Expose port 80
EXPOSE 80

# Disable Docker healthcheck - let Railway handle it
HEALTHCHECK NONE

