import type { IdentityGroup } from "./types"

export class GroupManager {
  private groups = new Map<string, IdentityGroup>()
  private groupMembers = new Map<string, Set<string>>()
  private userGroups = new Map<string, Set<string>>()

  private generateId(): string {
    return `grp_${this.groups.size + 1}_${Date.now()}`
  }

  createGroup(group: Omit<IdentityGroup, "id" | "createdAt" | "updatedAt">): IdentityGroup {
    const now = new Date()
    const created: IdentityGroup = {
      ...group,
      id: this.generateId(),
      createdAt: now,
      updatedAt: now,
    }
    this.groups.set(created.id, created)
    this.groupMembers.set(created.id, new Set())
    return created
  }

  updateGroup(id: string, updates: Partial<IdentityGroup>): IdentityGroup | undefined {
    const existing = this.groups.get(id)
    if (!existing) return undefined
    const updated = { ...existing, ...updates, updatedAt: new Date() }
    this.groups.set(id, updated)
    return updated
  }

  getGroup(id: string): IdentityGroup | undefined {
    return this.groups.get(id)
  }

  getAllGroups(): IdentityGroup[] {
    return Array.from(this.groups.values())
  }

  getGroupsByCompany(companyId: string): IdentityGroup[] {
    return Array.from(this.groups.values()).filter((g) => g.companyId === companyId)
  }

  deleteGroup(id: string): boolean {
    const members = this.groupMembers.get(id)
    if (members) {
      for (const userId of members) {
        const userSet = this.userGroups.get(userId)
        if (userSet) {
          userSet.delete(id)
          if (userSet.size === 0) this.userGroups.delete(userId)
        }
      }
    }
    this.groupMembers.delete(id)
    return this.groups.delete(id)
  }

  addMember(groupId: string, userId: string): boolean {
    const group = this.groups.get(groupId)
    if (!group) return false
    const members = this.groupMembers.get(groupId) ?? new Set()
    if (members.has(userId)) return false
    members.add(userId)
    this.groupMembers.set(groupId, members)
    group.memberCount = members.size
    const userSet = this.userGroups.get(userId) ?? new Set()
    userSet.add(groupId)
    this.userGroups.set(userId, userSet)
    return true
  }

  removeMember(groupId: string, userId: string): boolean {
    const members = this.groupMembers.get(groupId)
    if (!members || !members.has(userId)) return false
    members.delete(userId)
    this.groupMembers.set(groupId, members)
    const group = this.groups.get(groupId)
    if (group) group.memberCount = members.size
    const userSet = this.userGroups.get(userId)
    if (userSet) {
      userSet.delete(groupId)
      if (userSet.size === 0) this.userGroups.delete(userId)
    }
    return true
  }

  getMembers(groupId: string): string[] {
    return Array.from(this.groupMembers.get(groupId) ?? [])
  }

  getGroupsForUser(userId: string): IdentityGroup[] {
    const groupIds = this.userGroups.get(userId)
    if (!groupIds) return []
    return Array.from(groupIds)
      .map((id) => this.groups.get(id))
      .filter((g): g is IdentityGroup => g !== undefined)
  }

  syncGroupFromProvider(externalId: string, members: string[]): void {
    const group = Array.from(this.groups.values()).find((g) => g.externalId === externalId)
    if (!group) return
    const currentMembers = this.groupMembers.get(group.id) ?? new Set()
    const incoming = new Set(members)
    for (const userId of incoming) {
      if (!currentMembers.has(userId)) {
        this.addMember(group.id, userId)
      }
    }
    for (const userId of currentMembers) {
      if (!incoming.has(userId)) {
        this.removeMember(group.id, userId)
      }
    }
  }

  count(): number {
    return this.groups.size
  }
}

export const groupManager = new GroupManager()
