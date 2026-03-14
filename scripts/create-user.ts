import { createClient } from '@supabase/supabase-js'

// Configuración - necesitas tus credenciales de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Faltan variables de entorno')
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗')
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗')
  process.exit(1)
}

// Cliente con clave de servicio para crear usuarios
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createUser() {
  const email = 'admin@stila.com'
  const password = 'Admin123!'
  const userData = {
    email,
    password,
    email_confirm: true // Confirmar email automáticamente
  }

  console.log('Creando usuario:', email)

  try {
    const { data, error } = await supabaseAdmin.auth.admin.createUser(userData)

    if (error) {
      console.error('Error al crear usuario:', error.message)
      return
    }

    if (data.user) {
      console.log('✓ Usuario creado exitosamente!')
      console.log('ID:', data.user.id)
      console.log('Email:', data.user.email)
      console.log('')
      console.log('Credenciales para login:')
      console.log('  Email:', email)
      console.log('  Password:', password)
      
      // También crear el perfil en user_profiles
      console.log('')
      console.log('Creando perfil de usuario...')
      
      const { error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .insert({
          id: data.user.id,
          user_id: data.user.id,
          email: email,
          role: 'admin',
          first_name: 'Administrador',
          last_name: 'STILA',
          is_active: true
        })

      if (profileError) {
        console.error('Error al crear perfil:', profileError.message)
      } else {
        console.log('✓ Perfil creado exitosamente!')
      }
    }
  } catch (err) {
    console.error('Error inesperado:', err)
  }
}

createUser()
