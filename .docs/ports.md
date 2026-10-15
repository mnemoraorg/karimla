# Local development ports

These are the ports reserved for local development. They are not expected to be listening unless the corresponding service is running.

| Service         |    Port | Local address            | Configuration            |
| --------------- | ------: | ------------------------ | ------------------------ |
| Web application | `35000` | <http://localhost:35000> | `apps/web/package.json`  |
| API             | `35080` | <http://localhost:35080> | `apps/api/Makefile`      |
| Auth            | `35081` | <http://localhost:35081> | `apps/auth/package.json` |

Each service owns its port; check before starting a service so a duplicate listener does not hide a stale one.

To check whether a port is occupied on macOS or Linux:

```sh
lsof -nP -iTCP:35000 -sTCP:LISTEN
```
