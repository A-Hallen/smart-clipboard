# Flujo de Usuario: Gemini + Firebase

## Resumen Visual

```mermaid
flowchart TD
    Start([Inicio App])
    CheckAuth{¿Usuario autenticado?}
    Anonymous[Usar Firestore anónimo]
    Login[Login Google, Email, etc.]
    AuthUser[Firestore con usuario autenticado]
    UseApp[Usar app: leer/escribir historial]
    Upgrade{¿Usuario inicia sesión?}
    Migrate[Migrar datos anónimos → cuenta]
    End([Fin])

    Start --> CheckAuth
    CheckAuth -- Sí --> AuthUser
    CheckAuth -- No --> Anonymous
    Anonymous --> UseApp
    AuthUser --> UseApp
    UseApp --> Upgrade
    Upgrade -- Sí --> Migrate --> AuthUser
    Upgrade -- No --> End
```

---

## Casos de Uso

### 1. Usuario anónimo
- Puede usar la app inmediatamente.
- El historial se guarda en Firestore bajo un UID anónimo.
- El historial se sincroniza offline/online.

### 2. Usuario autenticado
- Puede iniciar sesión con Google, Email, etc.
- El historial se asocia a su cuenta, accesible desde cualquier dispositivo.
- Ventajas: backup cloud, multi-dispositivo, migración de datos.

### 3. Migración de datos
- Si un usuario anónimo inicia sesión, los datos locales/anónimos se migran a su cuenta.
- No se pierden datos.

### 4. Offline/Online
- La app funciona sin conexión (Firestore offline persistence).
- Los cambios se sincronizan al recuperar la conexión.

---

## Estados de la App

| Estado                | Descripción                                                  |
|-----------------------|-------------------------------------------------------------|
| Cargando              | Verificando estado de auth, inicializando Firestore          |
| Anónimo               | Usuario usando Firestore anónimo, historial local/cloud      |
| Autenticado           | Usuario autenticado, historial sincronizado multi-dispositivo|
| Migrando              | Migrando historial anónimo a la cuenta del usuario           |
| Offline               | Sin conexión, usando datos locales                           |

---

## Diagrama de Secuencia Simplificado

```mermaid
sequenceDiagram
    participant Usuario
    participant App
    participant Auth
    participant Firestore
    Usuario->>App: Abre la app
    App->>Auth: Verifica estado
    Auth-->>App: UID (anónimo o autenticado)
    App->>Firestore: Suscribe a historial
    Firestore-->>App: Cambios en tiempo real
    Usuario->>App: Añade/edita/borrar item
    App->>Firestore: Actualiza historial
    Note right of App: Si usuario inicia sesión
    App->>Auth: Login
    Auth-->>App: Nuevo UID
    App->>Firestore: Migrar historial
```
