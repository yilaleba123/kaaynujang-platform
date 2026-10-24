export interface Lecon {
  id: number;
  titre: string;
  contenu: string;
  completed?: boolean;
}

export interface ModuleCours {
  id: number;
  titre: string;
  lecons: Lecon[];
}

export interface CoursCatalogue {
  id: number;
  titre: string;
  description: string;
  image: string;
  niveau: "Débutant" | "Intermédiaire" | "Avancé";
  est_inscrit?: boolean;
  progression?: number;
  formateur?: string;
  modules?: ModuleCours[];
}
