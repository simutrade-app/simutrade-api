gcloud config set project ${GOOGLE_CLOUD_PROJECT}

gcloud services enable \
    compute.googleapis.com \
    sqladmin.googleapis.com \
    run.googleapis.com \
    artifactregistry.googleapis.com \
    cloudbuild.googleapis.com \
    networkconnectivity.googleapis.com \
    servicenetworking.googleapis.com \
    cloudaicompanion.googleapis.com \
    domains.googleapis.com \
    aiplatform.googleapis.com

gcloud iam service-accounts create simutrade-service-account \
    --display-name="SimuTrade Service Account"

gcloud projects add-iam-policy-binding ${GOOGLE_CLOUD_PROJECT} \
    --member="serviceAccount:simutrade-service-account@${GOOGLE_CLOUD_PROJECT}.iam.gserviceaccount.com" \
    --role="roles/logging.logWriter"

gcloud projects add-iam-policy-binding ${GOOGLE_CLOUD_PROJECT} \
    --member="serviceAccount:simutrade-service-account@${GOOGLE_CLOUD_PROJECT}.iam.gserviceaccount.com" \
    --role="roles/cloudsql.client"

gcloud network-connectivity service-connection-policies create simutrade-network-policy \
    --network=default \
    --project=${GOOGLE_CLOUD_PROJECT} \
    --region=asia-southeast2 \
    --service-class=google-cloud-sql \
    --subnets=https://www.googleapis.com/compute/v1/projects/${GOOGLE_CLOUD_PROJECT}/regions/asia-southeast2/subnetworks/default


gcloud sql instances create simutrade-db-instance \
    --project=${GOOGLE_CLOUD_PROJECT} \
    --root-password=${DB_PASSWORD} \
    --database-version=POSTGRES_17 \
    --tier=db-g1-small \
    --region=asia-southeast2 \
    --ssl-mode=ENCRYPTED_ONLY \
    --no-assign-ip \
    --enable-private-service-connect \
    --psc-auto-connections=network=projecs/${GOOGLE_CLOUD_PROJECT}/global/networks/default

gcloud sql databases create simutrade_db \
    --instance=simutrade-db-instance

gcloud run deploy ${GOOGLE_CLOUD_PROJECT} \
    --region=asia-southeast2 \
    --source=. \
    --set-env-vars DB_NAME="simutrade_db" \
    --set-env-vars DB_USER="postgres" \
    --set-env-vars DB_PASSWORD=${DB_PASSWORD} \
    --set-env-vars DB_HOST="$(gcloud sql instances describe simutrade-db-instance --project=${GOOGLE_CLOUD_PROJECT} --format='value(settings.ipConfiguration.pscConfig.pscAutoConnections.ipAddress)')" \
    --service-account="simutrade-service-account@${GOOGLE_CLOUD_PROJECT}.iam.gserviceaccount.com"
    --network=default
    --subnet=default
    --allow-unauthenticated