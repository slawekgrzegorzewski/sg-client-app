npm run buildProd

$env:TAG="slawekgrzegorzewski/client:$args"
$env:TAG_LATEST="slawekgrzegorzewski/client:latest"

pwd

docker buildx build -f docker/Dockerfile --platform linux/amd64 -t $env:TAG -t $env:TAG_LATEST .
docker push $env:TAG
docker push $env:TAG_LATEST
