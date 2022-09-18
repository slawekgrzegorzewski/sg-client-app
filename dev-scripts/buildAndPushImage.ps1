npm run buildProd

$env:TAG="215372400964.dkr.ecr.eu-central-1.amazonaws.com/client:$args"
$env:TAG_LATEST="215372400964.dkr.ecr.eu-central-1.amazonaws.com/client:latest"

aws ecr get-login-password --region eu-central-1 | docker login --username AWS --password-stdin 215372400964.dkr.ecr.eu-central-1.amazonaws.com

docker buildx build -f docker/Dockerfile --platform linux/amd64 -t $env:TAG -t $env:TAG_LATEST .
docker push $env:TAG
docker push $env:TAG_LATEST
