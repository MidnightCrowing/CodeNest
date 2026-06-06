export enum LicenseEnum {
  MIT = 'MIT License',
  APACHE_2_0 = 'Apache License 2.0',
  BSD_2_CLAUSE = 'BSD 2-Clause "Simplified" License',
  BSD_3_CLAUSE = 'BSD 3-Clause "New" or "Revised" License',
  GPLV2 = 'GNU General Public License v2.0',
  GPLV3 = 'GNU General Public License v3.0',
  LGPLV2_1 = 'GNU Lesser General Public License v2.1',
  LGPLV3 = 'GNU Lesser General Public License v3.0',
  AGPLV3 = 'GNU Affero General Public License v3.0',
  MPL_2_0 = 'Mozilla Public License 2.0',
  ECLIPSE_2_0 = 'Eclipse Public License 2.0',
  CDDL_1_0 = 'Common Development and Distribution License 1.0',
  CDDL_1_1 = 'Common Development and Distribution License 1.1',
  BOOST_1_0 = 'Boost Software License 1.0',
  CC0_1_0 = 'Creative Commons Zero v1.0 Universal',
  UNLICENSE = 'The Unlicense',
  WTFPL = 'Do What The F*ck You Want To Public License',
  ZLIB = 'zlib License',
  ISC = 'ISC License',
  ARTISTIC_2_0 = 'Artistic License 2.0',
  AFL_3_0 = 'Academic Free License v3.0',
  OSL_3_0 = 'Open Software License 3.0',
  NPOSL_3_0 = 'Non-Profit Open Software License 3.0',
  EUPL_1_1 = 'European Union Public License 1.1',
  EUPL_1_2 = 'European Union Public License 1.2',
  CECILL_2_1 = 'CeCILL License 2.1',
  CECILL_B = 'CeCILL-B License',
  CECILL_C = 'CeCILL-C License',
  SOLDERPAD_1_1 = 'Solderpad License 1.1',
  APACHE_1_1 = 'Apache License 1.1',
  OPEN_FONT_1_1 = 'SIL Open Font License 1.1',
  MS_PL = 'Microsoft Public License',
  MS_RL = 'Microsoft Reciprocal License',
  OTHER = 'Other',
  NONE = 'None',
}

export const LicenseInfo: Record<LicenseEnum, {
  detect?: { patterns: RegExp[] }
}> = {
  [LicenseEnum.MIT]: {
    detect: {
      patterns: [
        /permission is hereby granted, free of charge/i,
        /without restriction, including without limitation the rights to use, copy, modify/i,
      ],
    },
  },
  [LicenseEnum.APACHE_2_0]: {
    detect: {
      patterns: [
        /licensed under the apache license,? version 2\.0/i,
        /http(s)?:\/\/www\.apache\.org\/licenses\/license-2\.0/i,
      ],
    },
  },
  [LicenseEnum.BSD_2_CLAUSE]: {
    detect: {
      patterns: [
        /redistribution and use in source and binary forms, with or without modification/i,
        /this software is provided by the copyright holders and contributors "as is"/i,
      ],
    },
  },
  [LicenseEnum.BSD_3_CLAUSE]: {
    detect: {
      patterns: [
        /redistribution and use in source and binary forms, with or without modification/i,
        /neither the name of the .* nor the names of its contributors may be used/i,
      ],
    },
  },
  [LicenseEnum.GPLV2]: {
    detect: {
      patterns: [
        /gnu general public license/i,
        /version 2(\.0)?/i,
      ],
    },
  },
  [LicenseEnum.GPLV3]: {
    detect: {
      patterns: [
        /gnu general public license/i,
        /version 3(\.0)?/i,
      ],
    },
  },
  [LicenseEnum.LGPLV2_1]: {
    detect: {
      patterns: [
        /gnu lesser general public license/i,
        /version 2\.1/i,
      ],
    },
  },
  [LicenseEnum.LGPLV3]: {
    detect: {
      patterns: [
        /gnu lesser general public license/i,
        /version 3(\.0)?/i,
      ],
    },
  },
  [LicenseEnum.AGPLV3]: {
    detect: {
      patterns: [
        /gnu affero general public license/i,
        /version 3(\.0)?/i,
      ],
    },
  },
  [LicenseEnum.MPL_2_0]: {
    detect: {
      patterns: [
        /this source code form is subject to the terms of the mozilla public license,? v?\.? 2\.0/i,
      ],
    },
  },
  [LicenseEnum.ECLIPSE_2_0]: {
    detect: {
      patterns: [
        /eclipse public license -? v?\s*2\.0/i,
      ],
    },
  },
  [LicenseEnum.CDDL_1_0]: {
  },
  [LicenseEnum.CDDL_1_1]: {
  },
  [LicenseEnum.BOOST_1_0]: {
    detect: {
      patterns: [
        /boost software license -? version 1\.0/i,
      ],
    },
  },
  [LicenseEnum.CC0_1_0]: {
    detect: {
      patterns: [
        /creative commons zero v?1\.0/i,
        /cc0 1\.0/i,
      ],
    },
  },
  [LicenseEnum.UNLICENSE]: {
    detect: {
      patterns: [
        /this is free and unencumbered software released into the public domain/i,
        /the unlicense/i,
      ],
    },
  },
  [LicenseEnum.WTFPL]: {
    detect: {
      patterns: [
        /do what the f\*?uck you want to public license/i,
        /wtfpl/i,
      ],
    },
  },
  [LicenseEnum.ZLIB]: {
    detect: {
      patterns: [
        /this software is provided ['"]?as-?is['"]?, without any express or implied warranty/i,
        /the origin of this software must not be misrepresented/i,
      ],
    },
  },
  [LicenseEnum.ISC]: {
    detect: {
      patterns: [
        /permission to use, copy, modify, and\/or distribute this software for any purpose with or without fee/i,
        /the software is provided ['"]?as is['"]/i,
      ],
    },
  },
  [LicenseEnum.ARTISTIC_2_0]: {
    detect: {
      patterns: [
        /artistic license 2\.0/i,
      ],
    },
  },
  [LicenseEnum.AFL_3_0]: {
    detect: {
      patterns: [
        /academic free license v?3\.0/i,
      ],
    },
  },
  [LicenseEnum.OSL_3_0]: {
  },
  [LicenseEnum.NPOSL_3_0]: {
  },
  [LicenseEnum.EUPL_1_1]: {
  },
  [LicenseEnum.EUPL_1_2]: {
  },
  [LicenseEnum.CECILL_2_1]: {
  },
  [LicenseEnum.CECILL_B]: {
  },
  [LicenseEnum.CECILL_C]: {
  },
  [LicenseEnum.SOLDERPAD_1_1]: {
  },
  [LicenseEnum.APACHE_1_1]: {
  },
  [LicenseEnum.OPEN_FONT_1_1]: {
    detect: {
      patterns: [
        /s(i?)l open font license 1\.1/i,
        /sil open font license/i,
      ],
    },
  },
  [LicenseEnum.MS_PL]: {
    detect: {
      patterns: [
        /microsoft public license/i,
        /ms-pl/i,
      ],
    },
  },
  [LicenseEnum.MS_RL]: {
    detect: {
      patterns: [
        /microsoft reciprocal license/i,
        /ms-rl/i,
      ],
    },
  },
  [LicenseEnum.OTHER]: {
  },
  [LicenseEnum.NONE]: {
  },
}
