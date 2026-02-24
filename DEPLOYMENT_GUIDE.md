# Guía de Despliegue ERP STILA en Vercel

## Prerequisites
1. Cuenta en [Vercel](https://vercel.com) (gratis)
2. Cuenta en [Supabase](https://supabase.com)
3. Código en GitHub

---

## Paso 1: Sube tu código a GitHub
Si no lo has hecho, asegúrate de que tu código esté en:
`https://github.com/emartinezbernal/EPR-STILA`

---

## Paso 2: Configura las variables de entorno
Los valores están en tu archivo `.env.local`:

```
env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
```

---

## Paso 3: Despliega en Vercel

### 3.1 Ve a Vercel
1. Entra a [Vercel.com](https://vercel.com)
2. Inicia sesión con tu cuenta GitHub

### 3.2 Crea el proyecto
1. Clic en **"Add New..."** > **"Project"**
2. Busca tu repositorio `EPR-STILA` y selecciónalo
3. Clic en **"Import"**

### 3.3 Configura variables de entorno
En la sección **"Environment Variables"**, agrega:

| Nombre | Valor |
|--------|-------|
| NEXT_PUBLIC_SUPABASE_URL | (tu URL de Supabase) |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | (tu anon key de Supabase) |

### 3.4 Despliega
1. Clic en **"Deploy"**
2. Espera ~2 minutos
3. ¡Listo! Obtendrás una URL como: `https://epr-stila.vercel.app`

---

## Paso 4: Configura Supabase
1. Ve a tu proyecto Supabase
2. **Settings** > **Authentication** > **URL Configuration**
3. En "Site URL" agrega tu URL de Vercel
4. Clic en **Save**

---

## ¡Listo!
Tu ERP STILA estará disponible en la URL de Vercel.

## Notas importantes
- El modo demo funcionará sin conexión a Supabase
- Para datos persistentes, asegúrate de que las variables de entorno estén correctas
- Si tienes problemas, revisa la consola del navegador para ver errores
