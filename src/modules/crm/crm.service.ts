import type {
  CRMContact,
  CRMInteraction,
  CRMOpportunity,
  CRMTask,
  ContactIntelligence,
} from "./types";
import { prisma } from "@/server/db/prisma";
import { ForbiddenError } from "@/lib/errors/app-error";

// ── Enum Mapping ──────────────────────────────────────────────────────────────

function toPrismaEnum(ts: string): string {
  return ts.toUpperCase().replace(/-/g, "_");
}

function fromPrismaEnum(prisma: string): string {
  return prisma.toLowerCase().replace(/_/g, "-");
}

// ── Map Helpers ───────────────────────────────────────────────────────────────

function mapContactFromPrisma(contact: Record<string, unknown>): CRMContact {
  return {
    id: contact.id as string,
    name: contact.name as string,
    role: contact.role as string,
    company: contact.company as string | undefined,
    source: fromPrismaEnum(contact.source as string) as CRMContact["source"],
    relationshipStage: fromPrismaEnum(contact.relationshipStage as string) as CRMContact["relationshipStage"],
    status: (contact.status as string).toLowerCase() as CRMContact["status"],
    expertise: contact.expertise as string[],
    tags: contact.tags as string[],
    notes: contact.notes as string,
    isStrategicAdvisor: contact.isStrategicAdvisor as boolean,
    createdAt: contact.createdAt as Date,
    updatedAt: contact.updatedAt as Date,
    location: contact.location as string | undefined,
    whatsapp: contact.whatsapp as string | undefined,
    priority: (contact.priority as string | undefined)?.toLowerCase() as CRMContact["priority"],
    region: contact.region as string | undefined,
    relationshipType: contact.relationshipType as string | undefined,
    potentialRoles: contact.potentialRoles as string[] | undefined,
    classification: contact.classification
      ? (fromPrismaEnum(contact.classification as string) as NonNullable<CRMContact["classification"]>)
      : undefined,
    designPartnerPotential: contact.designPartnerPotential
      ? (fromPrismaEnum(contact.designPartnerPotential as string) as NonNullable<CRMContact["designPartnerPotential"]>)
      : undefined,
    productModules: contact.productModules as string[] | undefined,
    conversationSummary: contact.conversationSummary as string | undefined,
    keyProductInsights: contact.keyProductInsights as string[] | undefined,
    preferredLanguage: contact.preferredLanguage as string | undefined,
    industryExperience: contact.industryExperience as string[] | undefined,
    potentialContributions: contact.potentialContributions as string[] | undefined,
    recommendedNextSteps: contact.recommendedNextSteps as string[] | undefined,
    nextFollowUp: contact.nextFollowUp
      ? (contact.nextFollowUp as Date).toISOString()
      : undefined,
    conversationStatus: contact.conversationStatus as string | undefined,
    relationshipStrength: contact.relationshipStrength as number | undefined,
    trustScore: contact.trustScore as number | undefined,
    engagementLevel: contact.engagementLevel as string | undefined,
    championPotential: contact.championPotential as boolean | undefined,
    advisorPotential: contact.advisorPotential as boolean | undefined,
    investorPotential: contact.investorPotential as boolean | undefined,
    pilotCustomerPotential: contact.pilotCustomerPotential as boolean | undefined,
    referralPotential: contact.referralPotential as boolean | undefined,
    hiringPotential: contact.hiringPotential as boolean | undefined,
    strategicImportance: contact.strategicImportance
      ? (fromPrismaEnum(contact.strategicImportance as string) as NonNullable<CRMContact["strategicImportance"]>)
      : undefined,
    lastMeaningfulConversation: contact.lastMeaningfulConversation
      ? (contact.lastMeaningfulConversation as Date).toISOString()
      : undefined,
    nextRecommendedAction: contact.nextRecommendedAction as string | undefined,
    relationshipHealth: contact.relationshipHealth
      ? (fromPrismaEnum(contact.relationshipHealth as string) as NonNullable<CRMContact["relationshipHealth"]>)
      : undefined,
  };
}

function mapInteractionFromPrisma(interaction: Record<string, unknown>): CRMInteraction {
  return {
    id: interaction.id as string,
    contactId: interaction.contactId as string,
    type: fromPrismaEnum(interaction.type as string) as CRMInteraction["type"],
    channel: fromPrismaEnum(interaction.channel as string) as CRMInteraction["channel"],
    direction: fromPrismaEnum(interaction.direction as string) as CRMInteraction["direction"],
    sentiment: fromPrismaEnum(interaction.sentiment as string) as CRMInteraction["sentiment"],
    outcome: fromPrismaEnum(interaction.outcome as string) as CRMInteraction["outcome"],
    notes: (interaction.notes as string | undefined) ?? "",
    linkedInsights: interaction.linkedInsights
      ? (interaction.linkedInsights as Record<string, string[]>)
      : undefined,
    keyInsights: interaction.keyInsights as string[] | undefined,
    createdAt: interaction.createdAt as Date,
  };
}

function mapOpportunityFromPrisma(opportunity: Record<string, unknown>): CRMOpportunity {
  return {
    id: opportunity.id as string,
    contactId: opportunity.contactId as string,
    title: opportunity.title as string,
    stage: fromPrismaEnum(opportunity.stage as string) as CRMOpportunity["stage"],
    probability: opportunity.probability as number,
    category: fromPrismaEnum(opportunity.category as string) as CRMOpportunity["category"],
    potentialOutcomes: opportunity.potentialOutcomes as string[],
    priority: (opportunity.priority as string | undefined)?.toLowerCase() as CRMOpportunity["priority"],
    notes: opportunity.notes as string | undefined,
    createdAt: opportunity.createdAt as Date,
    updatedAt: opportunity.updatedAt as Date,
  };
}

function mapTaskFromPrisma(task: Record<string, unknown>): CRMTask {
  return {
    id: task.id as string,
    contactId: task.contactId as string,
    title: task.title as string,
    assignedTo: (task.assignedTo as string | undefined) ?? "",
    dueDate: task.dueDate as Date,
    status: (task.status as string).toLowerCase() as CRMTask["status"],
    notes: task.notes as string | undefined,
    createdAt: task.createdAt as Date,
    updatedAt: task.updatedAt as Date,
  };
}

function mapIntelligenceFromPrisma(intel: Record<string, unknown>): ContactIntelligence {
  return {
    contactId: intel.contactId as string,
    strengths: intel.strengths as string[],
    potentialValue: intel.potentialValue as string[],
    notes: intel.notes as string | undefined,
    updatedAt: intel.updatedAt as Date,
  };
}

// ── Service ───────────────────────────────────────────────────────────────────

export class CRMService {
  // ── P0-3: Tenant Isolation Helpers ────────────────────────────────────────

  /**
   * Verify that a contact belongs to the specified company.
   * Throws ForbiddenError if the contact does not exist or belongs to another tenant.
   */
  private async _verifyContactOwnership(
    contactId: string,
    companyId: string,
  ): Promise<void> {
    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
      select: { companyId: true },
    });
    if (!contact) throw new ForbiddenError("Contact not found");
    if (contact.companyId !== companyId) {
      throw new ForbiddenError("Access denied: contact belongs to another organization.");
    }
  }

  // --- Contacts ---

  async findContactByName(name: string, companyId: string): Promise<CRMContact | undefined> {
    const contact = await prisma.contact.findFirst({
      where: {
        name: { equals: name, mode: "insensitive" },
        companyId,
      },
    });
    return contact ? mapContactFromPrisma(contact) : undefined;
  }

  async findContactsByTag(tag: string, companyId: string): Promise<CRMContact[]> {
    const contacts = await prisma.contact.findMany({
      where: { tags: { has: tag }, companyId },
      orderBy: { createdAt: "desc" },
    });
    return contacts.map(mapContactFromPrisma);
  }

  async findContactsByAdvisorStatus(isAdvisor: boolean, companyId: string): Promise<CRMContact[]> {
    const contacts = await prisma.contact.findMany({
      where: { isStrategicAdvisor: isAdvisor, companyId },
      orderBy: { createdAt: "desc" },
    });
    return contacts.map(mapContactFromPrisma);
  }

  async findContactById(id: string, companyId: string): Promise<CRMContact | undefined> {
    const contact = await prisma.contact.findFirst({
      where: { id, companyId },
    });
    return contact ? mapContactFromPrisma(contact) : undefined;
  }

  async addContact(
    contact: Omit<CRMContact, "id" | "createdAt" | "updatedAt">,
    companyId: string,
  ): Promise<CRMContact> {
    const existing = await this.findContactByName(contact.name, companyId);
    if (existing) return existing;

    const created = await prisma.contact.create({
      data: {
        companyId,
        name: contact.name,
        role: contact.role,
        company: contact.company,
        source: toPrismaEnum(contact.source) as never,
        relationshipStage: toPrismaEnum(contact.relationshipStage) as never,
        status: contact.status.toUpperCase() as never,
        expertise: contact.expertise,
        tags: contact.tags,
        notes: contact.notes,
        isStrategicAdvisor: contact.isStrategicAdvisor,
        location: contact.location,
        whatsapp: contact.whatsapp,
        priority: contact.priority?.toUpperCase(),
        region: contact.region,
        relationshipType: contact.relationshipType,
        potentialRoles: contact.potentialRoles ?? [],
        classification: contact.classification
          ? (toPrismaEnum(contact.classification) as never)
          : undefined,
        designPartnerPotential: contact.designPartnerPotential
          ? (toPrismaEnum(contact.designPartnerPotential) as never)
          : undefined,
        productModules: contact.productModules ?? [],
        conversationSummary: contact.conversationSummary,
        keyProductInsights: contact.keyProductInsights ?? [],
        preferredLanguage: contact.preferredLanguage,
        industryExperience: contact.industryExperience ?? [],
        potentialContributions: contact.potentialContributions ?? [],
        recommendedNextSteps: contact.recommendedNextSteps ?? [],
        nextFollowUp: contact.nextFollowUp ? new Date(contact.nextFollowUp) : undefined,
        conversationStatus: contact.conversationStatus,
        relationshipStrength: contact.relationshipStrength,
        trustScore: contact.trustScore,
        engagementLevel: contact.engagementLevel,
        championPotential: contact.championPotential,
        advisorPotential: contact.advisorPotential,
        investorPotential: contact.investorPotential,
        pilotCustomerPotential: contact.pilotCustomerPotential,
        referralPotential: contact.referralPotential,
        hiringPotential: contact.hiringPotential,
        strategicImportance: contact.strategicImportance
          ? (toPrismaEnum(contact.strategicImportance) as never)
          : undefined,
        lastMeaningfulConversation: contact.lastMeaningfulConversation
          ? new Date(contact.lastMeaningfulConversation)
          : undefined,
        nextRecommendedAction: contact.nextRecommendedAction,
        relationshipHealth: contact.relationshipHealth
          ? (toPrismaEnum(contact.relationshipHealth) as never)
          : undefined,
      },
    });

    return mapContactFromPrisma(created);
  }

  async getAllContacts(companyId: string): Promise<CRMContact[]> {
    const contacts = await prisma.contact.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
    });
    return contacts.map(mapContactFromPrisma);
  }

  async updateContact(
    contactId: string,
    updates: Partial<CRMContact>,
    companyId: string,
  ): Promise<CRMContact | null> {
    await this._verifyContactOwnership(contactId, companyId);
    const existing = await prisma.contact.findUnique({ where: { id: contactId } });
    if (!existing) return null;

    const data: Record<string, unknown> = {};

    if (updates.name !== undefined) data.name = updates.name;
    if (updates.role !== undefined) data.role = updates.role;
    if (updates.company !== undefined) data.company = updates.company;
    if (updates.source !== undefined) data.source = toPrismaEnum(updates.source) as never;
    if (updates.relationshipStage !== undefined)
      data.relationshipStage = toPrismaEnum(updates.relationshipStage) as never;
    if (updates.status !== undefined) data.status = updates.status.toUpperCase() as never;
    if (updates.expertise !== undefined) data.expertise = updates.expertise;
    if (updates.tags !== undefined) data.tags = updates.tags;
    if (updates.notes !== undefined) data.notes = updates.notes;
    if (updates.isStrategicAdvisor !== undefined)
      data.isStrategicAdvisor = updates.isStrategicAdvisor;
    if (updates.location !== undefined) data.location = updates.location;
    if (updates.whatsapp !== undefined) data.whatsapp = updates.whatsapp;
    if (updates.priority !== undefined) data.priority = updates.priority?.toUpperCase();
    if (updates.region !== undefined) data.region = updates.region;
    if (updates.relationshipType !== undefined) data.relationshipType = updates.relationshipType;
    if (updates.potentialRoles !== undefined) data.potentialRoles = updates.potentialRoles;
    if (updates.classification !== undefined)
      data.classification = updates.classification
        ? (toPrismaEnum(updates.classification) as never)
        : undefined;
    if (updates.designPartnerPotential !== undefined)
      data.designPartnerPotential = updates.designPartnerPotential
        ? (toPrismaEnum(updates.designPartnerPotential) as never)
        : undefined;
    if (updates.productModules !== undefined) data.productModules = updates.productModules;
    if (updates.conversationSummary !== undefined)
      data.conversationSummary = updates.conversationSummary;
    if (updates.keyProductInsights !== undefined) data.keyProductInsights = updates.keyProductInsights;
    if (updates.preferredLanguage !== undefined) data.preferredLanguage = updates.preferredLanguage;
    if (updates.industryExperience !== undefined) data.industryExperience = updates.industryExperience;
    if (updates.potentialContributions !== undefined)
      data.potentialContributions = updates.potentialContributions;
    if (updates.recommendedNextSteps !== undefined)
      data.recommendedNextSteps = updates.recommendedNextSteps;
    if (updates.nextFollowUp !== undefined)
      data.nextFollowUp = updates.nextFollowUp ? new Date(updates.nextFollowUp) : undefined;
    if (updates.conversationStatus !== undefined)
      data.conversationStatus = updates.conversationStatus;
    if (updates.relationshipStrength !== undefined)
      data.relationshipStrength = updates.relationshipStrength;
    if (updates.trustScore !== undefined) data.trustScore = updates.trustScore;
    if (updates.engagementLevel !== undefined) data.engagementLevel = updates.engagementLevel;
    if (updates.championPotential !== undefined) data.championPotential = updates.championPotential;
    if (updates.advisorPotential !== undefined) data.advisorPotential = updates.advisorPotential;
    if (updates.investorPotential !== undefined) data.investorPotential = updates.investorPotential;
    if (updates.pilotCustomerPotential !== undefined)
      data.pilotCustomerPotential = updates.pilotCustomerPotential;
    if (updates.referralPotential !== undefined) data.referralPotential = updates.referralPotential;
    if (updates.hiringPotential !== undefined) data.hiringPotential = updates.hiringPotential;
    if (updates.strategicImportance !== undefined)
      data.strategicImportance = updates.strategicImportance
        ? (toPrismaEnum(updates.strategicImportance) as never)
        : undefined;
    if (updates.lastMeaningfulConversation !== undefined)
      data.lastMeaningfulConversation = updates.lastMeaningfulConversation
        ? new Date(updates.lastMeaningfulConversation)
        : undefined;
    if (updates.nextRecommendedAction !== undefined)
      data.nextRecommendedAction = updates.nextRecommendedAction;
    if (updates.relationshipHealth !== undefined)
      data.relationshipHealth = updates.relationshipHealth
        ? (toPrismaEnum(updates.relationshipHealth) as never)
        : undefined;

    const updated = await prisma.contact.update({
      where: { id: contactId },
      data,
    });

    return mapContactFromPrisma(updated);
  }

  async setAdvisorStatus(
    contactId: string,
    isAdvisor: boolean,
    companyId: string,
  ): Promise<CRMContact | null> {
    return this.updateContact(contactId, { isStrategicAdvisor: isAdvisor }, companyId);
  }

  // --- Interactions ---

  async addInteraction(
    interaction: Omit<CRMInteraction, "id" | "createdAt">,
    companyId: string,
  ): Promise<CRMInteraction> {
    await this._verifyContactOwnership(interaction.contactId, companyId);
    const created = await prisma.interaction.create({
      data: {
        contactId: interaction.contactId,
        type: toPrismaEnum(interaction.type) as never,
        channel: (interaction.channel ? toPrismaEnum(interaction.channel) : undefined) as never,
        direction: (interaction.direction ? toPrismaEnum(interaction.direction) : undefined) as never,
        sentiment: (interaction.sentiment ? toPrismaEnum(interaction.sentiment) : undefined) as never,
        outcome: (interaction.outcome ? toPrismaEnum(interaction.outcome) : undefined) as never,
        notes: interaction.notes,
        linkedInsights: interaction.linkedInsights ?? undefined,
        keyInsights: interaction.keyInsights ?? [],
      },
    });

    return mapInteractionFromPrisma(created);
  }

  async getContactInteractions(contactId: string, companyId: string): Promise<CRMInteraction[]> {
    await this._verifyContactOwnership(contactId, companyId);
    const interactions = await prisma.interaction.findMany({
      where: { contactId },
      orderBy: { createdAt: "desc" },
    });
    return interactions.map(mapInteractionFromPrisma);
  }

  async getAllInteractions(companyId: string): Promise<CRMInteraction[]> {
    const interactions = await prisma.interaction.findMany({
      where: { contact: { companyId } },
      orderBy: { createdAt: "desc" },
    });
    return interactions.map(mapInteractionFromPrisma);
  }

  // --- Opportunities ---

  async addOpportunity(
    opportunity: Omit<CRMOpportunity, "id" | "createdAt" | "updatedAt">,
    companyId: string,
  ): Promise<CRMOpportunity> {
    await this._verifyContactOwnership(opportunity.contactId, companyId);
    const created = await prisma.opportunity.create({
      data: {
        contactId: opportunity.contactId,
        title: opportunity.title,
        stage: toPrismaEnum(opportunity.stage) as never,
        probability: opportunity.probability,
        category: toPrismaEnum(opportunity.category) as never,
        potentialOutcomes: opportunity.potentialOutcomes,
        priority: opportunity.priority?.toUpperCase(),
        notes: opportunity.notes,
      },
    });

    return mapOpportunityFromPrisma(created);
  }

  async getContactOpportunities(contactId: string, companyId: string): Promise<CRMOpportunity[]> {
    await this._verifyContactOwnership(contactId, companyId);
    const opportunities = await prisma.opportunity.findMany({
      where: { contactId },
      orderBy: { createdAt: "desc" },
    });
    return opportunities.map(mapOpportunityFromPrisma);
  }

  async getAllOpportunities(companyId: string): Promise<CRMOpportunity[]> {
    const opportunities = await prisma.opportunity.findMany({
      where: { contact: { companyId } },
      orderBy: { createdAt: "desc" },
    });
    return opportunities.map(mapOpportunityFromPrisma);
  }

  async updateOpportunity(
    opportunityId: string,
    updates: Partial<CRMOpportunity>,
    companyId: string,
  ): Promise<CRMOpportunity | null> {
    const existing = await prisma.opportunity.findUnique({
      where: { id: opportunityId },
      select: { contactId: true },
    });
    if (!existing) return null;
    await this._verifyContactOwnership(existing.contactId, companyId);

    const data: Record<string, unknown> = {};
    if (updates.title !== undefined) data.title = updates.title;
    if (updates.stage !== undefined) data.stage = toPrismaEnum(updates.stage) as never;
    if (updates.probability !== undefined) data.probability = updates.probability;
    if (updates.category !== undefined) data.category = toPrismaEnum(updates.category) as never;
    if (updates.potentialOutcomes !== undefined) data.potentialOutcomes = updates.potentialOutcomes;
    if (updates.priority !== undefined) data.priority = updates.priority?.toUpperCase();
    if (updates.notes !== undefined) data.notes = updates.notes;

    const updated = await prisma.opportunity.update({
      where: { id: opportunityId },
      data,
    });

    return mapOpportunityFromPrisma(updated);
  }

  // --- Tasks ---

  async addTask(
    task: Omit<CRMTask, "id" | "createdAt" | "updatedAt">,
    companyId: string,
  ): Promise<CRMTask> {
    await this._verifyContactOwnership(task.contactId, companyId);
    const created = await prisma.task.create({
      data: {
        contactId: task.contactId,
        title: task.title,
        assignedTo: task.assignedTo,
        dueDate: task.dueDate,
        status: task.status.toUpperCase() as never,
        notes: task.notes,
      },
    });

    return mapTaskFromPrisma(created);
  }

  async getContactTasks(contactId: string, companyId: string): Promise<CRMTask[]> {
    await this._verifyContactOwnership(contactId, companyId);
    const tasks = await prisma.task.findMany({
      where: { contactId },
      orderBy: { createdAt: "desc" },
    });
    return tasks.map(mapTaskFromPrisma);
  }

  async getAllTasks(companyId: string): Promise<CRMTask[]> {
    const tasks = await prisma.task.findMany({
      where: { contact: { companyId } },
      orderBy: { createdAt: "desc" },
    });
    return tasks.map(mapTaskFromPrisma);
  }

  async updateTask(
    taskId: string,
    updates: Partial<CRMTask>,
    companyId: string,
  ): Promise<CRMTask | null> {
    const existing = await prisma.task.findUnique({
      where: { id: taskId },
      select: { contactId: true },
    });
    if (!existing) return null;
    await this._verifyContactOwnership(existing.contactId, companyId);

    const data: Record<string, unknown> = {};
    if (updates.title !== undefined) data.title = updates.title;
    if (updates.assignedTo !== undefined) data.assignedTo = updates.assignedTo;
    if (updates.dueDate !== undefined) data.dueDate = updates.dueDate;
    if (updates.status !== undefined) data.status = updates.status.toUpperCase() as never;
    if (updates.notes !== undefined) data.notes = updates.notes;

    const updated = await prisma.task.update({
      where: { id: taskId },
      data,
    });

    return mapTaskFromPrisma(updated);
  }

  // --- Contact Intelligence ---

  async setContactIntelligence(
    intelligence: Omit<ContactIntelligence, "updatedAt">,
    companyId: string,
  ): Promise<ContactIntelligence> {
    await this._verifyContactOwnership(intelligence.contactId, companyId);
    const existing = await prisma.contactIntelligence.findUnique({
      where: { contactId: intelligence.contactId },
    });

    if (existing) {
      const updated = await prisma.contactIntelligence.update({
        where: { contactId: intelligence.contactId },
        data: {
          strengths: intelligence.strengths,
          potentialValue: intelligence.potentialValue,
          notes: intelligence.notes,
        },
      });
      return mapIntelligenceFromPrisma(updated);
    }

    const created = await prisma.contactIntelligence.create({
      data: {
        contactId: intelligence.contactId,
        strengths: intelligence.strengths,
        potentialValue: intelligence.potentialValue,
        notes: intelligence.notes,
      },
    });

    return mapIntelligenceFromPrisma(created);
  }

  async getContactIntelligence(
    contactId: string,
    companyId: string,
  ): Promise<ContactIntelligence | undefined> {
    await this._verifyContactOwnership(contactId, companyId);
    const intel = await prisma.contactIntelligence.findUnique({
      where: { contactId },
    });
    return intel ? mapIntelligenceFromPrisma(intel) : undefined;
  }

  async getAllIntelligence(companyId: string): Promise<ContactIntelligence[]> {
    const all = await prisma.contactIntelligence.findMany({
      where: { contact: { companyId } },
      orderBy: { createdAt: "desc" },
    });
    return all.map(mapIntelligenceFromPrisma);
  }
}
