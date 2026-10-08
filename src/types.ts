// Data shapes shared by the components.

export interface Member {
  uid: string;
  displayName: string;
  photoURL?: string | null;
}

export type Vote = "aligned" | "not_aligned" | "abstain";

export interface Alignment {
  enabled: boolean;
  closed?: boolean;
  /** ISO date when voting ends */
  votingDeadline: string;
  eligibleVoterIds?: string[];
  aligned?: number;
  notAligned?: number;
  totalVoted?: number;
  eligibleVoterCount?: number;
}

export interface Decision {
  id: string;
  title: string;
  rationale: string;
  tags?: string[];
  /** ISO date */
  createdAt: string;
  editedAt?: string;
  authorId: string;
  authorName?: string;
  authorPhoto?: string | null;
  source?: "slack" | "figma";
  pinned?: boolean;
  figmaPageUrl?: string;
  figmaPageName?: string;
  figmaFileUrl?: string;
  figmaFileName?: string;
  responsibleIds?: string[];
  links?: string[];
  alignment?: Alignment;
}

export interface Author {
  uid: string;
  name: string;
  photoURL?: string | null;
}

export interface DateRange {
  from: string;
  to: string | null;
  labelKey: string;
}
