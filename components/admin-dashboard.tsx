"use client"

import { useState, useEffect } from "react"
import {
  Users,
  CheckCircle,
  BarChart3,
  TrendingUp,
  Search,
  Download,
  Eye,
  Trash2,
  LogOut,
  Calendar,
  Mail,
  Phone,
  Award,
  Filter,
  MapPin,
} from "lucide-react"
import { getAllUsersData, getAdminStats, deleteUserData } from "@/lib/storage"
import { checklistData, getMaturityLevel } from "@/lib/checklist-data"
import Link from "next/link"

interface UserData {
  userId: string
  userData: {
    name: string
    email: string
    whatsapp: string
    location?: {
      latitude: number
      longitude: number
      city?: string
      state?: string
      country?: string
    }
  }
  answers: Record<string, boolean> | null
  completedAt: string | null
  totalScore: number
}

interface AdminStats {
  totalUsers: number
  completedDiagnostics: number
  averageScore: number
  topCategories: Array<{ category: string; averageScore: number }>
}

interface AdminDashboardProps {
  onLogout: () => void
}

// Componente para dropdown de categoria com respostas detalhadas
function CategoryDropdown({
  category,
  answers,
  stats,
}: {
  category: any
  answers: Array<{ question: string; answer: boolean | undefined; tip?: string }>
  stats: { answeredYes: number; answeredNo: number; notAnswered: number }
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getAnswerIcon = (answer: boolean | undefined) => {
    if (answer === true) return { icon: "✅", color: "#10b981", text: "Sim" }
    if (answer === false) return { icon: "❌", color: "#ef4444", text: "Não" }
    return { icon: "⚪", color: "#6b7280", text: "Não respondido" }
  }

  return (
    <div
      style={{
        border: "1px solid var(--border-subtle)",
        borderRadius: "0.5rem",
        overflow: "hidden",
      }}
    >
      {/* Header do dropdown */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: "100%",
          padding: "1rem",
          background: isExpanded ? "var(--sage)" : "white",
          color: isExpanded ? "white" : "var(--dark)",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          transition: "all 0.2s ease",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: 1 }}>
          <span style={{ fontSize: "0.9rem", fontWeight: "600" }}>{category.title}</span>

          {/* Barra de progresso */}
          <div style={{ flex: 1, maxWidth: "200px", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div
              style={{
                flex: 1,
                height: "6px",
                background: isExpanded ? "rgba(255,255,255,0.2)" : "#f1f5f9",
                borderRadius: "3px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${(stats.answeredYes / (stats.answeredYes + stats.answeredNo + stats.notAnswered)) * 100 || 0}%`,
                  height: "100%",
                  background: isExpanded ? "white" : "#10b981",
                  transition: "width 0.3s ease",
                }}
              />
            </div>
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: "600",
                minWidth: "35px",
                color: isExpanded ? "rgba(255,255,255,0.9)" : "var(--sage)",
              }}
            >
              {Math.round((stats.answeredYes / (stats.answeredYes + stats.answeredNo + stats.notAnswered)) * 100 || 0)}%
            </span>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", fontSize: "0.75rem" }}>
            <span
              style={{
                background: isExpanded ? "rgba(255,255,255,0.2)" : "#d1fae5",
                color: isExpanded ? "white" : "#065f46",
                padding: "0.25rem 0.5rem",
                borderRadius: "0.25rem",
              }}
            >
              ✅ {stats.answeredYes}
            </span>
            <span
              style={{
                background: isExpanded ? "rgba(255,255,255,0.2)" : "#fef3c7",
                color: isExpanded ? "white" : "#92400e",
                padding: "0.25rem 0.5rem",
                borderRadius: "0.25rem",
              }}
            >
              ❌ {stats.answeredNo}
            </span>
            {stats.notAnswered > 0 && (
              <span
                style={{
                  background: isExpanded ? "rgba(255,255,255,0.2)" : "#f1f5f9",
                  color: isExpanded ? "white" : "#475569",
                  padding: "0.25rem 0.5rem",
                  borderRadius: "0.25rem",
                }}
              >
                ⚪ {stats.notAnswered}
              </span>
            )}
          </div>
        </div>
        <span
          style={{
            fontSize: "1.2rem",
            transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
            marginLeft: "1rem",
          }}
        >
          ▼
        </span>
      </button>

      {/* Conteúdo expandível */}
      {isExpanded && (
        <div style={{ background: "white", borderTop: "1px solid var(--border-subtle)" }}>
          {answers.map((item, index) => {
            const answerInfo = getAnswerIcon(item.answer)
            return (
              <div
                key={index}
                style={{
                  padding: "1rem",
                  borderBottom: index < answers.length - 1 ? "1px solid #f1f5f9" : "none",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "1rem",
                }}
              >
                <div
                  style={{
                    fontSize: "1.2rem",
                    marginTop: "0.125rem",
                    flexShrink: 0,
                  }}
                >
                  {answerInfo.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      margin: "0 0 0.5rem 0",
                      fontWeight: "500",
                      color: "var(--dark)",
                      lineHeight: "1.4",
                    }}
                  >
                    {item.question}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: "600",
                        color: answerInfo.color,
                        background: `${answerInfo.color}15`,
                        padding: "0.25rem 0.5rem",
                        borderRadius: "0.25rem",
                      }}
                    >
                      {answerInfo.text}
                    </span>
                    {item.tip && (
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--warm-gray)",
                          fontStyle: "italic",
                          background: "#f8fafc",
                          padding: "0.25rem 0.5rem",
                          borderRadius: "0.25rem",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        💡 {item.tip}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [users, setUsers] = useState<UserData[]>([])
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "completed" | "incomplete">("all")
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showUserDetails, setShowUserDetails] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [usersData, statsData] = await Promise.all([getAllUsersData(), getAdminStats()])
      setUsers(usersData)
      setStats(statsData)
    } catch (error) {
      console.error("Error loading admin data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    const user = users.find((u) => u.userId === userId)
    const userName = user?.userData?.name || "usuário"

    if (confirm(`Tem certeza que deseja excluir o usuário "${userName}"? Esta ação não pode ser desfeita.`)) {
      setIsDeleting(userId)
      try {
        console.log(`Iniciando exclusão do usuário: ${userId}`)

        // Chamar a função de exclusão
        await deleteUserData(userId)

        console.log(`Usuário ${userId} excluído com sucesso`)

        // Recarregar dados após exclusão
        await loadData()

        alert(`Usuário "${userName}" excluído com sucesso!`)
      } catch (error) {
        console.error("Error deleting user:", error)
        alert(`Erro ao excluir usuário "${userName}". Tente novamente.`)
      } finally {
        setIsDeleting(null)
      }
    }
  }

  const handleViewUser = async (userId: string) => {
    try {
      const user = users.find((u) => u.userId === userId)
      if (user) {
        setSelectedUser(user)
        setShowUserDetails(true)
      }
    } catch (error) {
      console.error("Error loading user details:", error)
    }
  }

  const exportToCSV = () => {
    const csvContent = [
      ["Nome", "Email", "WhatsApp", "Cidade", "Estado", "Score", "Status", "Data de Conclusão"],
      ...filteredUsers.map((user) => [
        user.userData.name,
        user.userData.email,
        user.userData.whatsapp,
        user.userData.location?.city || "N/A",
        user.userData.location?.state || "N/A",
        user.totalScore.toString(),
        user.answers ? "Completo" : "Incompleto",
        user.completedAt ? new Date(user.completedAt).toLocaleDateString("pt-BR") : "N/A",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `diagnosticos-gmb-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.userData.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.userData.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.userData.location?.city && user.userData.location.city.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "completed" && user.answers !== null) ||
      (filterStatus === "incomplete" && user.answers === null)

    return matchesSearch && matchesFilter
  })

  const getScoreColor = (score: number) => {
    if (score >= 85) return "#10b981"
    if (score >= 50) return "#f59e0b"
    return "#ef4444"
  }

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div style={{ background: "var(--cream)", minHeight: "100vh" }}>
      {/* Header */}
      <header style={{ background: "white", borderBottom: "1px solid var(--border-subtle)" }}>
        <div
          className="container"
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.5rem 2rem" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <Link href="/" style={{ textDecoration: "none" }}>
              <img src="/images/climber-goat-logo.png" alt="Climber Goat" style={{ height: "2.5rem" }} />
            </Link>
            <div>
              <h1 style={{ fontSize: "1.5rem", fontWeight: "600", color: "var(--dark)", margin: 0 }}>
                Painel Administrativo
              </h1>
              <p style={{ fontSize: "0.875rem", color: "var(--warm-gray)", margin: 0 }}>
                Diagnósticos Google Meu Negócio
              </p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="btn btn-secondary"
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </header>

      <main className="container" style={{ padding: "2rem" }}>
        {/* Stats Cards */}
        {stats && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "1.5rem",
              marginBottom: "2rem",
            }}
          >
            <div className="card" style={{ textAlign: "center" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                <Users size={24} color="var(--sage)" />
              </div>
              <h3 style={{ fontSize: "2rem", fontWeight: "700", color: "var(--dark)", margin: "0 0 0.5rem 0" }}>
                {stats.totalUsers}
              </h3>
              <p style={{ color: "var(--warm-gray)", fontSize: "0.9rem" }}>Total de Usuários</p>
            </div>

            <div className="card" style={{ textAlign: "center" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                <CheckCircle size={24} color="var(--gold)" />
              </div>
              <h3 style={{ fontSize: "2rem", fontWeight: "700", color: "var(--dark)", margin: "0 0 0.5rem 0" }}>
                {stats.completedDiagnostics}
              </h3>
              <p style={{ color: "var(--warm-gray)", fontSize: "0.9rem" }}>Diagnósticos Completos</p>
            </div>

            <div className="card" style={{ textAlign: "center" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                <BarChart3 size={24} color="#10b981" />
              </div>
              <h3 style={{ fontSize: "2rem", fontWeight: "700", color: "var(--dark)", margin: "0 0 0.5rem 0" }}>
                {stats.averageScore}%
              </h3>
              <p style={{ color: "var(--warm-gray)", fontSize: "0.9rem" }}>Score Médio</p>
            </div>

            <div className="card" style={{ textAlign: "center" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                <TrendingUp size={24} color="#ef4444" />
              </div>
              <h3 style={{ fontSize: "2rem", fontWeight: "700", color: "var(--dark)", margin: "0 0 0.5rem 0" }}>
                {Math.round((stats.completedDiagnostics / stats.totalUsers) * 100) || 0}%
              </h3>
              <p style={{ color: "var(--warm-gray)", fontSize: "0.9rem" }}>Taxa de Conclusão</p>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="card" style={{ marginBottom: "2rem" }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "1rem",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", gap: "1rem", alignItems: "center", flex: 1 }}>
              <div style={{ position: "relative", flex: 1, maxWidth: "300px" }}>
                <Search
                  size={16}
                  style={{
                    position: "absolute",
                    left: "1rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--warm-gray)",
                  }}
                />
                <input
                  type="text"
                  placeholder="Buscar por nome, email ou cidade..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: "2.5rem" }}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Filter size={16} color="var(--warm-gray)" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="form-input"
                  style={{ width: "auto", minWidth: "150px" }}
                >
                  <option value="all">Todos</option>
                  <option value="completed">Completos</option>
                  <option value="incomplete">Incompletos</option>
                </select>
              </div>
            </div>

            <button
              onClick={exportToCSV}
              className="btn btn-secondary"
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <Download size={16} />
              Exportar CSV
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="card">
          <div style={{ marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "600", color: "var(--dark)" }}>
              Usuários ({filteredUsers.length})
            </h2>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border-subtle)" }}>
                  <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600", color: "var(--dark)" }}>Nome</th>
                  <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600", color: "var(--dark)" }}>
                    Contato
                  </th>
                  <th style={{ padding: "1rem", textAlign: "center", fontWeight: "600", color: "var(--dark)" }}>
                    Localização
                  </th>
                  <th style={{ padding: "1rem", textAlign: "center", fontWeight: "600", color: "var(--dark)" }}>
                    Score
                  </th>
                  <th style={{ padding: "1rem", textAlign: "center", fontWeight: "600", color: "var(--dark)" }}>
                    Status
                  </th>
                  <th style={{ padding: "1rem", textAlign: "center", fontWeight: "600", color: "var(--dark)" }}>
                    Data
                  </th>
                  <th style={{ padding: "1rem", textAlign: "center", fontWeight: "600", color: "var(--dark)" }}>
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.userId} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "1rem" }}>
                      <div>
                        <div style={{ fontWeight: "500", color: "var(--dark)" }}>{user.userData.name}</div>
                        <div style={{ fontSize: "0.875rem", color: "var(--warm-gray)" }}>
                          ID: {user.userId.slice(-8)}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <div style={{ fontSize: "0.875rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                          <Mail size={14} color="var(--warm-gray)" />
                          <span>{user.userData.email}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <Phone size={14} color="var(--warm-gray)" />
                          <span>{user.userData.whatsapp}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "1rem", textAlign: "center", fontSize: "0.875rem" }}>
                      {user.userData.location ? (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                          <MapPin size={14} color="var(--sage)" />
                          <div>
                            <div style={{ fontWeight: "500", color: "var(--dark)" }}>
                              {user.userData.location.city || "N/A"}
                            </div>
                            <div style={{ color: "var(--warm-gray)", fontSize: "0.75rem" }}>
                              {user.userData.location.state || "N/A"}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: "var(--warm-gray)" }}>-</span>
                      )}
                    </td>
                    <td style={{ padding: "1rem", textAlign: "center" }}>
                      {user.answers ? (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                          <div
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "50%",
                              background: `conic-gradient(${getScoreColor(user.totalScore)} ${user.totalScore * 3.6}deg, #f1f5f9 0deg)`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <div
                              style={{
                                width: "30px",
                                height: "30px",
                                borderRadius: "50%",
                                background: "white",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "0.75rem",
                                fontWeight: "600",
                              }}
                            >
                              {user.totalScore}%
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: "var(--warm-gray)" }}>-</span>
                      )}
                    </td>
                    <td style={{ padding: "1rem", textAlign: "center" }}>
                      <span
                        style={{
                          padding: "0.25rem 0.75rem",
                          borderRadius: "1rem",
                          fontSize: "0.75rem",
                          fontWeight: "500",
                          background: user.answers ? "#d1fae5" : "#fef3c7",
                          color: user.answers ? "#065f46" : "#92400e",
                        }}
                      >
                        {user.answers ? "Completo" : "Incompleto"}
                      </span>
                    </td>
                    <td
                      style={{ padding: "1rem", textAlign: "center", fontSize: "0.875rem", color: "var(--warm-gray)" }}
                    >
                      {user.completedAt ? (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                          <Calendar size={14} />
                          {new Date(user.completedAt).toLocaleDateString("pt-BR")}
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td style={{ padding: "1rem", textAlign: "center" }}>
                      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                        <button
                          onClick={() => handleViewUser(user.userId)}
                          style={{
                            padding: "0.5rem",
                            border: "1px solid var(--sage)",
                            borderRadius: "0.375rem",
                            background: "white",
                            color: "var(--sage)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          title="Ver detalhes"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.userId)}
                          disabled={isDeleting === user.userId}
                          style={{
                            padding: "0.5rem",
                            border: "1px solid #ef4444",
                            borderRadius: "0.375rem",
                            background: isDeleting === user.userId ? "#f3f4f6" : "white",
                            color: isDeleting === user.userId ? "#9ca3af" : "#ef4444",
                            cursor: isDeleting === user.userId ? "not-allowed" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            opacity: isDeleting === user.userId ? 0.5 : 1,
                          }}
                          title={isDeleting === user.userId ? "Excluindo..." : "Excluir usuário"}
                        >
                          {isDeleting === user.userId ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-red-500"></div>
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div style={{ textAlign: "center", padding: "3rem", color: "var(--warm-gray)" }}>
                <Users size={48} style={{ margin: "0 auto 1rem", opacity: 0.5 }} />
                <p>Nenhum usuário encontrado</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* User Details Modal */}
      {showUserDetails && selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => {
            setShowUserDetails(false)
            setSelectedUser(null)
          }}
        />
      )}
    </div>
  )
}

// Modal para detalhes do usuário
function UserDetailsModal({ user, onClose }: { user: UserData; onClose: () => void }) {
  const maturityLevel = getMaturityLevel(user.totalScore)

  const getScoreColor = (score: number) => {
    if (score >= 85) return "#10b981"
    if (score >= 50) return "#f59e0b"
    return "#ef4444"
  }

  const categoryScores = checklistData.map((category) => {
    if (!user.answers) return { title: category.title, score: 0 }

    const totalItems = category.items.length
    const completedItems = category.items.filter((item) => user.answers![item.id] === true).length
    const score = Math.round((completedItems / totalItems) * 100)

    return { title: category.title, score }
  })

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white",
          borderRadius: "1rem",
          padding: "2rem",
          maxWidth: "800px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "600", color: "var(--dark)", margin: "0 0 0.5rem 0" }}>
              {user.userData.name}
            </h2>
            <p style={{ color: "var(--warm-gray)", margin: 0 }}>Detalhes do diagnóstico</p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              color: "var(--warm-gray)",
            }}
          >
            ×
          </button>
        </div>

        {/* User Info */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginBottom: "2rem" }}>
          <div>
            <h3 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "1rem", color: "var(--dark)" }}>
              Informações de Contato
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Mail size={16} color="var(--warm-gray)" />
                <span>{user.userData.email}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Phone size={16} color="var(--warm-gray)" />
                <span>{user.userData.whatsapp}</span>
              </div>
              {user.userData.location && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <MapPin size={16} color="var(--warm-gray)" />
                  <span>
                    {user.userData.location.city}, {user.userData.location.state}
                  </span>
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Calendar size={16} color="var(--warm-gray)" />
                <span>
                  {user.completedAt && user.completedAt !== "null" && user.completedAt.trim() !== ""
                    ? new Date(user.completedAt).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : user.answers
                      ? "Concluído (data não registrada)"
                      : "Não concluído"}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "1rem", color: "var(--dark)" }}>
              Resultado Geral
            </h3>
            {user.answers ? (
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    background: `conic-gradient(${getScoreColor(user.totalScore)} ${user.totalScore * 3.6}deg, #f1f5f9 0deg)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 1rem",
                  }}
                >
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                      background: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.25rem",
                      fontWeight: "700",
                    }}
                  >
                    {user.totalScore}%
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                  <Award size={16} color="var(--gold)" />
                  <span style={{ fontWeight: "600", color: "var(--dark)" }}>{maturityLevel?.name}</span>
                </div>
              </div>
            ) : (
              <p style={{ color: "var(--warm-gray)", textAlign: "center", fontStyle: "italic" }}>
                Diagnóstico não concluído
              </p>
            )}
          </div>
        </div>

        {/* Category Scores */}
        {user.answers && (
          <div>
            <h3 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "1rem", color: "var(--dark)" }}>
              Pontuação por Categoria
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {checklistData.map((category, categoryIndex) => {
                const categoryScore = categoryScores.find((cat) => cat.title === category.title) || { score: 0 }
                const categoryAnswers = category.items.map((item) => ({
                  question: item.question,
                  answer: user.answers![item.id],
                  tip: item.tip,
                }))

                const answeredYes = categoryAnswers.filter((item) => item.answer === true).length
                const answeredNo = categoryAnswers.filter((item) => item.answer === false).length
                const notAnswered = categoryAnswers.filter((item) => item.answer === undefined).length

                return (
                  <CategoryDropdown
                    key={categoryIndex}
                    category={{ ...category, score: categoryScore.score }}
                    answers={categoryAnswers}
                    stats={{ answeredYes, answeredNo, notAnswered }}
                  />
                )
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ marginTop: "2rem", display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
          <a
            href={`https://wa.me/55${user.userData.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
              `Olá ${user.userData.name}! Vi que você fez nosso diagnóstico GMB e obteve ${user.totalScore}% de pontuação. Gostaria de conversar sobre como podemos ajudar a otimizar seu perfil?`,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <button
              className="btn"
              style={{
                background: "#25D366",
                color: "white",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <Phone size={16} />
              Contatar via WhatsApp
            </button>
          </a>
          <button onClick={onClose} className="btn btn-secondary">
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
