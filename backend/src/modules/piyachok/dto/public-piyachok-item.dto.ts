export interface PublicPiyachokItemDto {
  id: string;
  user: {
    name: string;
  };
  institution: {
    id: string;
    name: string;
  };
  date: Date;
  description: string;
  peopleCount: number;
  budget: number | null;
  createdAt: Date;
}
