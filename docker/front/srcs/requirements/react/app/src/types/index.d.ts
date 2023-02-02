declare module "*.png" {
  const value: any;
  export = value;
}
declare module "*.jpg" {
  const value: any;
  export = value;
}
declare module "*.gif" {
  const value: any;
  export = value;
}
declare module "*.bmp" {
  const value: any;
  export = value;
}

declare module "react-router-bootstrap";
declare module "js-cookie";
declare module "mdb-react-ui-kit";

interface UserHeaderInfosProvider {
  id: string;
  avatar: string;
}

interface UserInfosProvider {
  id: string;
  name: string;
  avatar: string;
  achievements: [
    {
      title: string;
      description: string;
      badge: string;
      score: number;
      goal: number;
    }
  ];
  stats: {
    wins: number;
    loses: number;
    rank: number;
  };
  games: [
    {
      id: string;
      myScore: number;
      enemyScore: number;
      timestamp: Date;
    }
  ];
  theme: string;
  tfa: boolean;
}
