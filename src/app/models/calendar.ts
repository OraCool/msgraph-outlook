export class Calendar {
  id: string;
  name: string;
  color: string;
  changeKey: string;
  canShare: boolean;
  canViewPrivateItems: boolean;
  canEdit: boolean;
  owner: Owner;
}

export class Owner {
  name: string;
  address: string;
}
