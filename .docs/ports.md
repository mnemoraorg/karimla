# Local development ports

These are the ports reserved for local development. They are not expected to be listening unless the corresponding service is running.

| Service         |    Port | Local address            | Configuration            |
| --------------- | ------: | ------------------------ | ------------------------ |
| Web application | `35000` | <http://localhost:35000> | `apps/web/package.json`  |
| API             | `35080` | <http://localhost:35080> | reserved for `apps/api`  |
| Auth            | `35081` | <http://localhost:35081> | reserved for `apps/auth` |

The web application is the only service with a configured port today. The API and auth ports are reserved so those applications do not collide with the web app when they are added.

To check whether a port is occupied on macOS or Linux:

```sh
lsof -nP -iTCP:35000 -sTCP:LISTEN
```
