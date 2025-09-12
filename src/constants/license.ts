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

interface LicenseDescription { fromUrl: string, permissions?: string[], conditions?: string[], limitations?: string[] }

export const LicenseInfo: Record<LicenseEnum, {
  name: string
  url: string
  description?: LicenseDescription
  // 匹配识别的正则列表
  detect?: { patterns: RegExp[] }
}> = {
  [LicenseEnum.MIT]: {
    name: 'MIT License',
    url: 'https://opensource.org/licenses/MIT',
    description: {
      fromUrl: 'license.mit.description_url',
      permissions: ['commercial_use', 'distribution', 'modification', 'private_use'],
      conditions: ['license_and_copyright_notice'],
      limitations: ['liability', 'warranty'],
    },
    detect: {
      patterns: [
        /permission is hereby granted, free of charge/i,
        /without restriction, including without limitation the rights to use, copy, modify/i,
      ],
    },
  },
  [LicenseEnum.APACHE_2_0]: {
    name: 'Apache License 2.0',
    url: 'https://www.apache.org/licenses/LICENSE-2.0',
    description: {
      fromUrl: 'license.apache_2_0.description_url',
      permissions: ['commercial_use', 'distribution', 'modification', 'patent_use', 'private_use'],
      conditions: ['license_and_copyright_notice', 'state_changes'],
      limitations: ['liability', 'trademark_use', 'warranty'],
    },
    detect: {
      patterns: [
        /licensed under the apache license,? version 2\.0/i,
        /http(s)?:\/\/www\.apache\.org\/licenses\/license-2\.0/i,
      ],
    },
  },
  [LicenseEnum.BSD_2_CLAUSE]: {
    name: 'BSD 2-Clause "Simplified" License',
    url: 'https://opensource.org/licenses/BSD-2-Clause',
    description: {
      fromUrl: 'license.bsd_2_clause.description_url',
      permissions: ['commercial_use', 'distribution', 'modification', 'private_use'],
      conditions: ['license_and_copyright_notice'],
      limitations: ['liability', 'warranty'],
    },
    detect: {
      patterns: [
        /redistribution and use in source and binary forms, with or without modification/i,
        /this software is provided by the copyright holders and contributors "as is"/i,
      ],
    },
  },
  [LicenseEnum.BSD_3_CLAUSE]: {
    name: 'BSD 3-Clause "New" or "Revised" License',
    url: 'https://opensource.org/licenses/BSD-3-Clause',
    description: {
      fromUrl: 'license.bsd_3_clause.description_url',
      permissions: ['commercial_use', 'distribution', 'modification', 'private_use'],
      conditions: ['license_and_copyright_notice'],
      limitations: ['liability', 'warranty'],
    },
    detect: {
      patterns: [
        /redistribution and use in source and binary forms, with or without modification/i,
        /neither the name of the .* nor the names of its contributors may be used/i,
      ],
    },
  },
  [LicenseEnum.GPLV2]: {
    name: 'GNU General Public License v2.0',
    url: 'https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html',
    description: {
      fromUrl: 'license.gplv2.description_url',
      permissions: ['commercial_use', 'distribution', 'modification', 'private_use'],
      conditions: ['disclose_source', 'license_and_copyright_notice', 'same_license', 'state_changes'],
      limitations: ['liability', 'warranty'],
    },
    detect: {
      patterns: [
        /gnu general public license/i,
        /version 2(\.0)?/i,
      ],
    },
  },
  [LicenseEnum.GPLV3]: {
    name: 'GNU General Public License v3.0',
    url: 'https://www.gnu.org/licenses/gpl-3.0.en.html',
    description: {
      fromUrl: 'license.gplv3.description_url',
      permissions: ['commercial_use', 'distribution', 'modification', 'patent_use', 'private_use'],
      conditions: ['disclose_source', 'license_and_copyright_notice', 'same_license', 'state_changes'],
      limitations: ['liability', 'warranty'],
    },
    detect: {
      patterns: [
        /gnu general public license/i,
        /version 3(\.0)?/i,
      ],
    },
  },
  [LicenseEnum.LGPLV2_1]: {
    name: 'GNU Lesser General Public License v2.1',
    url: 'https://www.gnu.org/licenses/old-licenses/lgpl-2.1.en.html',
    description: {
      fromUrl: 'license.lgplv2_1.description_url',
      permissions: ['commercial_use', 'distribution', 'modification', 'private_use'],
      conditions: ['disclose_source', 'license_and_copyright_notice', 'same_license_library', 'state_changes'],
      limitations: ['liability', 'warranty'],
    },
    detect: {
      patterns: [
        /gnu lesser general public license/i,
        /version 2\.1/i,
      ],
    },
  },
  [LicenseEnum.LGPLV3]: {
    name: 'GNU Lesser General Public License v3.0',
    url: 'https://www.gnu.org/licenses/lgpl-3.0.en.html',
    description: {
      fromUrl: 'license.lgplv3.description_url',
      permissions: ['commercial_use', 'distribution', 'modification', 'patent_use', 'private_use'],
      conditions: ['disclose_source', 'license_and_copyright_notice', 'same_license_library', 'state_changes'],
      limitations: ['liability', 'warranty'],
    },
    detect: {
      patterns: [
        /gnu lesser general public license/i,
        /version 3(\.0)?/i,
      ],
    },
  },
  [LicenseEnum.AGPLV3]: {
    name: 'GNU Affero General Public License v3.0',
    url: 'https://www.gnu.org/licenses/agpl-3.0.en.html',
    description: {
      fromUrl: 'license.agplv3.description_url',
      permissions: ['commercial_use', 'distribution', 'modification', 'patent_use', 'private_use'],
      conditions: ['disclose_source', 'license_and_copyright_notice', 'network_use_is_distribution', 'same_license', 'state_changes'],
      limitations: ['liability', 'warranty'],
    },
    detect: {
      patterns: [
        /gnu affero general public license/i,
        /version 3(\.0)?/i,
      ],
    },
  },
  [LicenseEnum.MPL_2_0]: {
    name: 'Mozilla Public License 2.0',
    url: 'https://www.mozilla.org/en-US/MPL/2.0/',
    description: {
      fromUrl: 'license.mpl_2_0.description_url',
      permissions: ['commercial_use', 'distribution', 'modification', 'patent_use', 'private_use'],
      conditions: ['disclose_source', 'license_and_copyright_notice', 'same_license_file'],
      limitations: ['liability', 'trademark_use', 'warranty'],
    },
    detect: {
      patterns: [
        /this source code form is subject to the terms of the mozilla public license,? v?\.? 2\.0/i,
      ],
    },
  },
  [LicenseEnum.ECLIPSE_2_0]: {
    name: 'Eclipse Public License 2.0',
    url: 'https://www.eclipse.org/legal/epl-2.0/',
    description: {
      fromUrl: 'license.eclipse_2_0.description_url',
      permissions: ['commercial_use', 'distribution', 'modification', 'patent_use', 'private_use'],
      conditions: ['disclose_source', 'license_and_copyright_notice', 'same_license'],
      limitations: ['liability', 'warranty'],
    },
    detect: {
      patterns: [
        /eclipse public license -? v?\s*2\.0/i,
      ],
    },
  },
  [LicenseEnum.CDDL_1_0]: {
    name: 'Common Development and Distribution License 1.0',
    url: 'https://opensource.org/licenses/CDDL-1.0',
  },
  [LicenseEnum.CDDL_1_1]: {
    name: 'Common Development and Distribution License 1.1',
    url: 'https://opensource.org/licenses/CDDL-1.1',
  },
  [LicenseEnum.BOOST_1_0]: {
    name: 'Boost Software License 1.0',
    url: 'https://www.boost.org/LICENSE_1_0.txt',
    description: {
      fromUrl: 'license.boost_1_0.description_url',
      permissions: ['commercial_use', 'distribution', 'modification', 'private_use'],
      conditions: ['license_and_copyright_notice_for_source'],
      limitations: ['liability', 'warranty'],
    },
    detect: {
      patterns: [
        /boost software license -? version 1\.0/i,
      ],
    },
  },
  [LicenseEnum.CC0_1_0]: {
    name: 'Creative Commons Zero v1.0 Universal',
    url: 'https://creativecommons.org/publicdomain/zero/1.0/',
    description: {
      fromUrl: 'license.cc0_1_0.description_url',
      permissions: ['commercial_use', 'distribution', 'modification', 'private_use'],
      limitations: ['liability', 'patent_use', 'trademark_use', 'warranty'],
    },
    detect: {
      patterns: [
        /creative commons zero v?1\.0/i,
        /cc0 1\.0/i,
      ],
    },
  },
  [LicenseEnum.UNLICENSE]: {
    name: 'The Unlicense',
    url: 'https://unlicense.org/',
    description: {
      fromUrl: 'license.unlicense.description_url',
      permissions: ['commercial_use', 'distribution', 'modification', 'private_use'],
      limitations: ['liability', 'warranty'],
    },
    detect: {
      patterns: [
        /this is free and unencumbered software released into the public domain/i,
        /the unlicense/i,
      ],
    },
  },
  [LicenseEnum.WTFPL]: {
    name: 'Do What The F*ck You Want To Public License',
    url: 'http://www.wtfpl.net/',
    description: {
      fromUrl: 'license.wtfpl.description_url',
      permissions: ['commercial_use', 'distribution', 'modification', 'private_use'],
    },
    detect: {
      patterns: [
        /do what the f\*?uck you want to public license/i,
        /wtfpl/i,
      ],
    },
  },
  [LicenseEnum.ZLIB]: {
    name: 'zlib License',
    url: 'https://opensource.org/licenses/Zlib',
    description: {
      fromUrl: 'license.zlib.description_url',
      permissions: ['commercial_use', 'distribution', 'modification', 'private_use'],
      conditions: ['license_and_copyright_notice_for_source', 'state_changes'],
      limitations: ['liability', 'warranty'],
    },
    detect: {
      patterns: [
        /this software is provided ['"]?as-?is['"]?, without any express or implied warranty/i,
        /the origin of this software must not be misrepresented/i,
      ],
    },
  },
  [LicenseEnum.ISC]: {
    name: 'ISC License',
    url: 'https://opensource.org/licenses/ISC',
    description: {
      fromUrl: 'license.isc.description_url',
      permissions: ['commercial_use', 'distribution', 'modification', 'private_use'],
      conditions: ['license_and_copyright_notice'],
      limitations: ['liability', 'warranty'],
    },
    detect: {
      patterns: [
        /permission to use, copy, modify, and\/or distribute this software for any purpose with or without fee/i,
        /the software is provided ['"]?as is['"]/i,
      ],
    },
  },
  [LicenseEnum.ARTISTIC_2_0]: {
    name: 'Artistic License 2.0',
    url: 'https://opensource.org/licenses/Artistic-2.0',
    description: {
      fromUrl: 'license.artistic_2_0.description_url',
      permissions: ['commercial_use', 'distribution', 'modification', 'patent_use', 'private_use'],
      conditions: ['license_and_copyright_notice', 'state_changes'],
      limitations: ['liability', 'trademark_use', 'warranty'],
    },
    detect: {
      patterns: [
        /artistic license 2\.0/i,
      ],
    },
  },
  [LicenseEnum.AFL_3_0]: {
    name: 'Academic Free License v3.0',
    url: 'https://opensource.org/licenses/AFL-3.0',
    description: {
      fromUrl: 'license.afl_3_0.description_url',
      permissions: ['commercial_use', 'distribution', 'modification', 'patent_use', 'private_use'],
      conditions: ['license_and_copyright_notice', 'state_changes'],
      limitations: ['liability', 'trademark_use', 'warranty'],
    },
    detect: {
      patterns: [
        /academic free license v?3\.0/i,
      ],
    },
  },
  [LicenseEnum.OSL_3_0]: {
    name: 'Open Software License 3.0',
    url: 'https://opensource.org/licenses/OSL-3.0',
    description: {
      fromUrl: 'license.osl_3_0.description_url',
      permissions: ['commercial_use', 'distribution', 'modification', 'patent_use', 'private_use'],
      conditions: ['disclose_source', 'license_and_copyright_notice', 'network_use_is_distribution', 'same_license', 'state_changes'],
      limitations: ['liability', 'trademark_use', 'warranty'],
    },
  },
  [LicenseEnum.NPOSL_3_0]: {
    name: 'Non-Profit Open Software License 3.0',
    url: 'https://opensource.org/licenses/NPOSL-3.0',
  },
  [LicenseEnum.EUPL_1_1]: {
    name: 'European Union Public License 1.1',
    url: 'https://joinup.ec.europa.eu/collection/eupl/eupl-text-11-12',
    description: {
      fromUrl: 'license.eupl_1_1.description_url',
      permissions: ['commercial_use', 'distribution', 'modification', 'patent_use', 'private_use'],
      conditions: ['disclose_source', 'license_and_copyright_notice', 'network_use_is_distribution', 'same_license', 'state_changes'],
      limitations: ['liability', 'trademark_use', 'warranty'],
    },
  },
  [LicenseEnum.EUPL_1_2]: {
    name: 'European Union Public License 1.2',
    url: 'https://joinup.ec.europa.eu/collection/eupl/eupl-text-11-12',
    description: {
      fromUrl: 'license.eupl_1_2.description_url',
      permissions: ['commercial_use', 'distribution', 'modification', 'patent_use', 'private_use'],
      conditions: ['disclose_source', 'license_and_copyright_notice', 'network_use_is_distribution', 'same_license', 'state_changes'],
      limitations: ['liability', 'trademark_use', 'warranty'],
    },
  },
  [LicenseEnum.CECILL_2_1]: {
    name: 'CeCILL License 2.1',
    url: 'http://www.cecill.info/licences/Licence_CeCILL_V2.1-en.html',
  },
  [LicenseEnum.CECILL_B]: {
    name: 'CeCILL-B License',
    url: 'http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.html',
  },
  [LicenseEnum.CECILL_C]: {
    name: 'CeCILL-C License',
    url: 'http://www.cecill.info/licences/Licence_CeCILL-C_V1-en.html',
  },
  [LicenseEnum.SOLDERPAD_1_1]: {
    name: 'Solderpad License 1.1',
    url: 'https://solderpad.org/licenses/SHL-1.1/',
  },
  [LicenseEnum.APACHE_1_1]: {
    name: 'Apache License 1.1',
    url: 'https://apache.org/licenses/LICENSE-1.1',
  },
  [LicenseEnum.OPEN_FONT_1_1]: {
    name: 'SIL Open Font License 1.1',
    url: 'https://opensource.org/licenses/OFL-1.1',
    description: {
      fromUrl: 'license.open_font_1_1.description_url',
      permissions: ['commercial_use', 'distribution', 'modification', 'private_use'],
      conditions: ['license_and_copyright_notice', 'same_license'],
      limitations: ['liability', 'warranty'],
    },
    detect: {
      patterns: [
        /s(i?)l open font license 1\.1/i,
        /sil open font license/i,
      ],
    },
  },
  [LicenseEnum.MS_PL]: {
    name: 'Microsoft Public License',
    url: 'https://opensource.org/licenses/MS-PL',
    description: {
      fromUrl: 'license.ms_pl.description_url',
      permissions: ['commercial_use', 'distribution', 'modification', 'patent_use', 'private_use'],
      conditions: ['license_and_copyright_notice'],
      limitations: ['trademark_use', 'warranty'],
    },
    detect: {
      patterns: [
        /microsoft public license/i,
        /ms-pl/i,
      ],
    },
  },
  [LicenseEnum.MS_RL]: {
    name: 'Microsoft Reciprocal License',
    url: 'https://opensource.org/licenses/MS-RL',
    description: {
      fromUrl: 'license.ms_rl.description_url',
      permissions: ['commercial_use', 'distribution', 'modification', 'patent_use', 'private_use'],
      conditions: ['disclose_source', 'license_and_copyright_notice', 'same_license_file'],
      limitations: ['trademark_use', 'warranty'],
    },
    detect: {
      patterns: [
        /microsoft reciprocal license/i,
        /ms-rl/i,
      ],
    },
  },
  [LicenseEnum.OTHER]: {
    name: 'Other',
    url: '',
  },
  [LicenseEnum.NONE]: {
    name: 'None',
    url: '',
  },
}
