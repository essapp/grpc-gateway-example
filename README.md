#
```
protoc -I=. -I $GOPATH/pkg/mod/github.com/googleapis/googleapis@v0.0.0-20251210232721-b32495a713a6 \
-I=$GOPATH/pkg/mod/github.com/grpc-ecosystem/grpc-gateway/v2@v2.27.3 \
--go_out=.  \
--go_opt=paths=source_relative \
--go-grpc_out=. \
--go-grpc_opt=paths=source_relative \
--go-grpc_opt=require_unimplemented_servers=false \
--grpc-gateway_out=. \
--grpc-gateway_opt=paths=source_relative \
--openapiv2_out=. \
./examples/internal/proto/*/*
```