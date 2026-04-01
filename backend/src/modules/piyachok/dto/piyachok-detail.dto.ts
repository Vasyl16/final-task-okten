export interface PiyachokDetailDto {
  id: string;
  user: {
    name: string;
  };
  institution: {
    id: string;
    name: string;
    lat: number;
    lng: number;
  };
  date: Date;
  description: string;
  peopleCount: number;
  genderPreference: string | null;
  budget: number | null;
  whoPays: string | null;
  createdAt: Date;
}
