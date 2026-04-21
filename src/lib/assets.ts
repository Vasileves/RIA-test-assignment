export const asset = (hash: string) => `/figma-assets/${hash}.svg`;
export const assetPng = (hash: string) => `/figma-assets/${hash}.png`;

export const ASSETS = {
  userCircle: asset("305e09140d757289339ab2000611a8224154653a"),
  question: asset("4d7d2f9d983322f19af7f4292fd625b14d967c19"),
  faceIdShape: asset("50caf906b315d5f7b1319f502386bbe6db2e1e4a"),
  walletIcon: asset("8ee7018b585f0386cb78cb85d795f293858bf818"),
  shieldIcon: asset("f1ff240cf0606e941af2cfd923c3057ee024c16a"),
  arrowUpRight: asset("4fec567f504e75dc596aba95c465de4b6952c022"),
  listNumbers: asset("1d5ca40270e180ed10c01e6e1f1e2de2d6f58d0c"),
  plusCircle: asset("c5f8d127a84d01bbce44ac007f5a43fc57776c70"),
  mastercard: asset("85d3efd857a2be48ed9ed2ca779d3151ffdb507b"),
  chaseLogo: asset("c3a7ac7bdce5bc862ebd21137149a0c977b6161d"),
  eyeSmall: asset("3a0dd96639aadf01ee1e5073a36fa9c38b404db4"),
  eye18: asset("51bc41724ab82ce1afa23aa4fda16cab5abfe77f"),
  pencilSimple: asset("86d8e4a39870d1732bda2e7c4f625ccc25ce9060"),
  plus: asset("ea516aa6665aa1ba721f7eb008ed94c0fa67e513"),
  paperPlaneOutline: asset("6c3fa853d49be17885eecfdfe2d3d07d27cce0dc"),
  paperPlaneWhite: asset("e9936d3084257ee73458d5f162cc396999bb6efd"),
  wrench: asset("51a9036d084926e07813aae1b06cb3a0f4fdb0b5"),
  navHome: asset("5693333179db0a72a8528d20071200cf2b3f7b2a"),
  navContacts: asset("5cc06ffbbc1e4cbc6be903135aff59855c5d4663"),
  navTrack: asset("6668aa5c4bc0a788199ee0234d3f664e4896acfe"),
  navLocations: asset("76e7c6ef5463c2c7ec054bc40f929f295c85af52"),
  amazonCart: asset("7a100ff2b997ce18332f3a72b1f12fd71738903a"),
  starbucksFork: asset("ed935db315da5cec7f67b92f516d84909fc7d3b4"),
  sarahAvatar: assetPng("7a9a8c5c4294de4010821f854cd84f2b8b292776"),
} as const;
