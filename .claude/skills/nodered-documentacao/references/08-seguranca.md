# Segurança

Fonte: `docs/user-guide/runtime/securing-node-red.md` (+ settings.js 5.0.7)

**Por padrão o editor não tem segurança**: qualquer um que alcance o IP pode abrir o editor e fazer deploy. Só é aceitável em rede confiável. Três partes: HTTPS, editor/Admin API, nós HTTP (e Dashboard).

## 1. HTTPS
Opção `https` no settings: objeto estático ou (1.1.0+) função que retorna o objeto ou uma Promise. Mínimo: `key` e `cert` (PEM, String ou Buffer). Opções completas: `tls.createSecureContext`.
```javascript
https: {
    key: require("fs").readFileSync('privkey.pem'),
    cert: require("fs").readFileSync('cert.pem')
},
```
### Renovar certificados sem reiniciar (1.1.0+)
1. Node.js 11+.
2. `https` precisa ser **função**.
3. `httpsRefreshInterval` = de quantas em quantas horas chamar a função.
A função decide se o certificado vence no próximo intervalo; se não precisa atualizar, retorna `undefined`/`null`.

`requireHttps: true` redireciona HTTP para HTTPS.

## 2. Editor e Admin API
Dois tipos: usuário/senha, ou OAuth/OpenID (Passport: Twitter, GitHub...).

### Usuário/senha
```javascript
adminAuth: {
    type: "credentials",
    users: [
        { username: "admin",  password: "$2a$08$zZWtXTja0fB1pzD4sHCMyOCMYz2Z6dNbM6tl8sJogENOMcxWV9DN.", permissions: "*" },
        { username: "george", password: "$2b$08$wuAqPiKJlVN27eF5qJp.RuQYuy6ZYONW7a/UWYxDTtwKFCdB8F19y", permissions: "read" }
    ]
}
```
- `users` é um array; senhas em **bcrypt** (no exemplo, admin tem senha `password`).
- `httpAdminAuth` (Basic Auth com MD5) é **obsoleto** — não use.

### Gerar o hash
- Node-RED 1.1.0+: `node-red admin hash-pw`
- Antigas: `node-red-admin hash-pw` (ferramenta separada) ou, no diretório de instalação: `node -e "console.log(require('bcryptjs').hashSync(process.argv[1], 8));" sua-senha`

### OAuth/OpenID (Passport)
Módulos prontos: `node-red-auth-twitter`, `node-red-auth-github`. Configuração direta:
```javascript
adminAuth: {
    type: "strategy",
    strategy: {
        name: "twitter", label: 'Sign in with Twitter', icon: "fa-twitter",
        strategy: require("passport-twitter").Strategy,
        options: {
            consumerKey: ..., consumerSecret: ...,
            callbackURL: "http://example.com/auth/strategy/callback",
            verify: function(token, tokenSecret, profile, done) { done(null, profile); }
        }
    },
    users: [ { username: "knolleary", permissions: ["*"] } ]
}
```
- `name`, `strategy`, `label`/`icon` (FontAwesome), `options`, `verify` (deve chamar `done(null, perfil)` com `username`), `autoLogin` (redireciona direto ao provedor).
- `callbackURL` = URL do editor + `/auth/strategy/callback` (ex.: `http://localhost:1880/auth/strategy/callback`). Padrão GET; `callbackMethod: "POST"` para POST.

### Usuário padrão (acesso anônimo)
```javascript
adminAuth: { type: "credentials", users: [ ... ], default: { permissions: "read" } }
```

### Permissões
- Antes de 0.14: `*` (total) ou `read`.
- 0.14+: string ou **array**, modelo por recurso — ex.: `flows.read` para ler fluxos, `flows.write` para alterar. Cada método da Admin API diz a permissão exigida (`14-admin-api.md`).

Ao pedir token pela Admin API, o `scope` documentado é só `*` ou `read` (ver `14-admin-api.md`); a granularidade vem das `permissions` do usuário.

### Expiração de token
Padrão **7 dias**; sem refresh. Ajuste em segundos: `adminAuth: { sessionExpiryTime: 86400, ... }` (1 dia).

### Autenticação customizada
Módulo `user-authentication.js`:
```javascript
module.exports = {
   type: "credentials",
   users: function(username) { return new Promise(resolve => {
       // valida o usuário; resolve({username, permissions}) ou resolve(null)
   }); },
   authenticate: function(username, password) { return new Promise(resolve => {
       // valida usuário+senha; resolve(user) ou resolve(null)
   }); },
   default: function() { return new Promise(resolve => {
       resolve({anonymous: true, permissions: "read"});   // ou null
   }); }
}
// settings.js
adminAuth: require("./user-authentication")
```

### Tokens próprios (1.1.0+)
Para OAuth + acesso automatizado à API, ou integrar com sistema onde o usuário já está logado:
```javascript
adminAuth: {
    ...
    tokens: function(token) { return new Promise((resolve, reject) => {
        // valida; resolve({username:'admin', permissions:'*'}) ou resolve(null)
    }); },
    tokenHeader: "x-my-custom-token"   // opcional
}
```
- Chamada quando a requisição traz token que o Node-RED não reconhece como seu.
- Padrão: cabeçalho `Authorization` tipo `Bearer` (passa só o valor); se não for Bearer, passa o valor inteiro do cabeçalho.
- Editor com token próprio sem prompt de login: `?access_token=<TOKEN>` na URL (o editor guarda e reutiliza).

## 3. Nós HTTP e conteúdo estático
```javascript
httpNodeAuth:   {user:"user", pass:"$2a$08$zZWtXTja0fB1pzD4sHCMyOCMYz2Z6dNbM6tl8sJogENOMcxWV9DN."},
httpStaticAuth: {user:"user", pass:"$2a$08$..."},
```
- Um único usuário/senha para as rotas dos HTTP In (inclui node-red-dashboard).
- `pass` em bcrypt (MD5 ainda aceito por compatibilidade, **não recomendado**).

## 4. Middleware customizado
- `httpNodeMiddleware` (antes de todos os HTTP In). Ex.: limitar taxa (instale `express-rate-limit` em `~/.node-red`):
  ```javascript
  var rateLimit = require("express-rate-limit");
  module.exports = {
      httpNodeMiddleware: rateLimit({ windowMs: 1000, max: 10 })   // 10 req/s
  }
  ```
  Evita esgotar memória quando fluxos HTTP demoram. Ao exceder: "Too many requests, please try again later."
- `httpAdminMiddleware` (1.1.0+, rotas admin/editor). Ex.: controlar embed do editor:
  ```javascript
  httpAdminMiddleware: function(req, res, next) {
      res.set('X-Frame-Options', 'sameorigin');
      next();
  },
  ```

## Outros pontos relacionados
- **Credenciais dos nós**: guardadas à parte (`flows_cred.json` ao lado do arquivo de fluxos), criptografadas; `credentialSecret` define a chave (não mude depois). Nos Projects, a chave não fica no repositório.
- `tlsConfigDisableLocalFiles`, `webSocketNodeVerifyClient`, `diagnostics.enabled` (expõe `/diagnostics`) — ver `07-settings-runtime.md`.
- `externalModules.palette.allowInstall: false` impede instalar nós pelo editor.
