export function hasAdminPermission(user: any): boolean {
  // Verifica se o usuário tem permissões de admin baseado no Supabase
  return user && user.email && user.role === "admin"
}

export function requireAdminAccess(user: any): void {
  if (!hasAdminPermission(user)) {
    throw new Error("Acesso negado: permissões de administrador necessárias")
  }
}
