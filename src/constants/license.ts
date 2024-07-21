import { i18n } from '~/utils/i18n'

export const { t } = i18n.global

export enum License {
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
}

interface LicenseDescription { fromUrl: string, permissions?: string[], conditions?: string[], limitations?: string[] }

export const LicenseInfo: { [key in License]: { name: string, url: string, description?: LicenseDescription } } = {
  [License.MIT]: {
    name: 'MIT License',
    url: 'https://opensource.org/licenses/MIT',
    description: {
      fromUrl: t('license.mit.description_url'),
      permissions: [t('license.info.commercial_use'), t('license.info.distribution'), t('license.info.modification'), t('license.info.private_use')],
      conditions: [t('license.info.license_and_copyright_notice')],
      limitations: [t('license.info.liability'), t('license.info.warranty')],
    },
  },
  [License.APACHE_2_0]: {
    name: 'Apache License 2.0',
    url: 'https://www.apache.org/licenses/LICENSE-2.0',
    description: {
      fromUrl: t('license.apache_2_0.description_url'),
      permissions: [t('license.info.commercial_use'), t('license.info.distribution'), t('license.info.modification'), t('license.info.patent_use'), t('license.info.private_use')],
      conditions: [t('license.info.license_and_copyright_notice'), t('license.info.state_changes')],
      limitations: [t('license.info.liability'), t('license.info.trademark_use'), t('license.info.warranty')],
    },
  },
  [License.BSD_2_CLAUSE]: {
    name: 'BSD 2-Clause "Simplified" License',
    url: 'https://opensource.org/licenses/BSD-2-Clause',
    description: {
      fromUrl: t('license.bsd_2_clause.description_url'),
      permissions: [t('license.info.commercial_use'), t('license.info.distribution'), t('license.info.modification'), t('license.info.private_use')],
      conditions: [t('license.info.license_and_copyright_notice')],
      limitations: [t('license.info.liability'), t('license.info.warranty')],
    },
  },
  [License.BSD_3_CLAUSE]: {
    name: 'BSD 3-Clause "New" or "Revised" License',
    url: 'https://opensource.org/licenses/BSD-3-Clause',
    description: {
      fromUrl: t('license.bsd_3_clause.description_url'),
      permissions: [t('license.info.commercial_use'), t('license.info.distribution'), t('license.info.modification'), t('license.info.private_use')],
      conditions: [t('license.info.license_and_copyright_notice')],
      limitations: [t('license.info.liability'), t('license.info.warranty')],
    },
  },
  [License.GPLV2]: {
    name: 'GNU General Public License v2.0',
    url: 'https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html',
    description: {
      fromUrl: t('license.gplv2.description_url'),
      permissions: [t('license.info.commercial_use'), t('license.info.distribution'), t('license.info.modification'), t('license.info.private_use')],
      conditions: [t('license.info.disclose_source'), t('license.info.license_and_copyright_notice'), t('license.info.same_license'), t('license.info.state_changes')],
      limitations: [t('license.info.liability'), t('license.info.warranty')],
    },
  },
  [License.GPLV3]: {
    name: 'GNU General Public License v3.0',
    url: 'https://www.gnu.org/licenses/gpl-3.0.en.html',
    description: {
      fromUrl: t('license.gplv3.description_url'),
      permissions: [t('license.info.commercial_use'), t('license.info.distribution'), t('license.info.modification'), t('license.info.patent_use'), t('license.info.private_use')],
      conditions: [t('license.info.disclose_source'), t('license.info.license_and_copyright_notice'), t('license.info.same_license'), t('license.info.state_changes')],
      limitations: [t('license.info.liability'), t('license.info.warranty')],
    },
  },
  [License.LGPLV2_1]: {
    name: 'GNU Lesser General Public License v2.1',
    url: 'https://www.gnu.org/licenses/old-licenses/lgpl-2.1.en.html',
    description: {
      fromUrl: t('license.lgplv2_1.description_url'),
      permissions: [t('license.info.commercial_use'), t('license.info.distribution'), t('license.info.modification'), t('license.info.private_use')],
      conditions: [t('license.info.disclose_source'), t('license.info.license_and_copyright_notice'), t('license.info.same_license_library'), t('license.info.state_changes')],
      limitations: [t('license.info.liability'), t('license.info.warranty')],
    },
  },
  [License.LGPLV3]: {
    name: 'GNU Lesser General Public License v3.0',
    url: 'https://www.gnu.org/licenses/lgpl-3.0.en.html',
    description: {
      fromUrl: t('license.lgplv3.description_url'),
      permissions: [t('license.info.commercial_use'), t('license.info.distribution'), t('license.info.modification'), t('license.info.patent_use'), t('license.info.private_use')],
      conditions: [t('license.info.disclose_source'), t('license.info.license_and_copyright_notice'), t('license.info.same_license_library'), t('license.info.state_changes')],
      limitations: [t('license.info.liability'), t('license.info.warranty')],
    },
  },
  [License.AGPLV3]: {
    name: 'GNU Affero General Public License v3.0',
    url: 'https://www.gnu.org/licenses/agpl-3.0.en.html',
    description: {
      fromUrl: t('license.agplv3.description_url'),
      permissions: [t('license.info.commercial_use'), t('license.info.distribution'), t('license.info.modification'), t('license.info.patent_use'), t('license.info.private_use')],
      conditions: [t('license.info.disclose_source'), t('license.info.license_and_copyright_notice'), t('license.info.network_use_is_distribution'), t('license.info.same_license'), t('license.info.state_changes')],
      limitations: [t('license.info.liability'), t('license.info.warranty')],
    },
  },
  [License.MPL_2_0]: {
    name: 'Mozilla Public License 2.0',
    url: 'https://www.mozilla.org/en-US/MPL/2.0/',
    description: {
      fromUrl: t('license.mpl_2_0.description_url'),
      permissions: [t('license.info.commercial_use'), t('license.info.distribution'), t('license.info.modification'), t('license.info.patent_use'), t('license.info.private_use')],
      conditions: [t('license.info.disclose_source'), t('license.info.license_and_copyright_notice'), t('license.info.same_license_file')],
      limitations: [t('license.info.liability'), t('license.info.trademark_use'), t('license.info.warranty')],
    },
  },
  [License.ECLIPSE_2_0]: {
    name: 'Eclipse Public License 2.0',
    url: 'https://www.eclipse.org/legal/epl-2.0/',
    description: {
      fromUrl: t('license.eclipse_2_0.description_url'),
      permissions: [t('license.info.commercial_use'), t('license.info.distribution'), t('license.info.modification'), t('license.info.patent_use'), t('license.info.private_use')],
      conditions: [t('license.info.disclose_source'), t('license.info.license_and_copyright_notice'), t('license.info.same_license')],
      limitations: [t('license.info.liability'), t('license.info.warranty')],
    },
  },
  [License.CDDL_1_0]: {
    name: 'Common Development and Distribution License 1.0',
    url: 'https://opensource.org/licenses/CDDL-1.0',
  },
  [License.CDDL_1_1]: {
    name: 'Common Development and Distribution License 1.1',
    url: 'https://opensource.org/licenses/CDDL-1.1',
  },
  [License.BOOST_1_0]: {
    name: 'Boost Software License 1.0',
    url: 'https://www.boost.org/LICENSE_1_0.txt',
    description: {
      fromUrl: t('license.boost_1_0.description_url'),
      permissions: [t('license.info.commercial_use'), t('license.info.distribution'), t('license.info.modification'), t('license.info.private_use')],
      conditions: [t('license.info.license_and_copyright_notice_for_source')],
      limitations: [t('license.info.liability'), t('license.info.warranty')],
    },
  },
  [License.CC0_1_0]: {
    name: 'Creative Commons Zero v1.0 Universal',
    url: 'https://creativecommons.org/publicdomain/zero/1.0/',
    description: {
      fromUrl: t('license.cc0_1_0.description_url'),
      permissions: [t('license.info.commercial_use'), t('license.info.distribution'), t('license.info.modification'), t('license.info.private_use')],
      limitations: [t('license.info.liability'), t('license.info.patent_use'), t('license.info.trademark_use'), t('license.info.warranty')],
    },
  },
  [License.UNLICENSE]: {
    name: 'The Unlicense',
    url: 'https://unlicense.org/',
    description: {
      fromUrl: t('license.unlicense.description_url'),
      permissions: [t('license.info.commercial_use'), t('license.info.distribution'), t('license.info.modification'), t('license.info.private_use')],
      limitations: [t('license.info.liability'), t('license.info.warranty')],
    },
  },
  [License.WTFPL]: {
    name: 'Do What The F*ck You Want To Public License',
    url: 'http://www.wtfpl.net/',
    description: {
      fromUrl: t('license.wtfpl.description_url'),
      permissions: [t('license.info.commercial_use'), t('license.info.distribution'), t('license.info.modification'), t('license.info.private_use')],
    },
  },
  [License.ZLIB]: {
    name: 'zlib License',
    url: 'https://opensource.org/licenses/Zlib',
    description: {
      fromUrl: t('license.zlib.description_url'),
      permissions: [t('license.info.commercial_use'), t('license.info.distribution'), t('license.info.modification'), t('license.info.private_use')],
      conditions: [t('license.info.license_and_copyright_notice_for_source'), t('license.info.state_changes')],
      limitations: [t('license.info.liability'), t('license.info.warranty')],
    },
  },
  [License.ISC]: {
    name: 'ISC License',
    url: 'https://opensource.org/licenses/ISC',
    description: {
      fromUrl: t('license.isc.description_url'),
      permissions: [t('license.info.commercial_use'), t('license.info.distribution'), t('license.info.modification'), t('license.info.private_use')],
      conditions: [t('license.info.license_and_copyright_notice')],
      limitations: [t('license.info.liability'), t('license.info.warranty')],
    },
  },
  [License.ARTISTIC_2_0]: {
    name: 'Artistic License 2.0',
    url: 'https://opensource.org/licenses/Artistic-2.0',
    description: {
      fromUrl: t('license.artistic_2_0.description_url'),
      permissions: [t('license.info.commercial_use'), t('license.info.distribution'), t('license.info.modification'), t('license.info.patent_use'), t('license.info.private_use')],
      conditions: [t('license.info.license_and_copyright_notice'), t('license.info.state_changes')],
      limitations: [t('license.info.liability'), t('license.info.trademark_use'), t('license.info.warranty')],
    },
  },
  [License.AFL_3_0]: {
    name: 'Academic Free License v3.0',
    url: 'https://opensource.org/licenses/AFL-3.0',
    description: {
      fromUrl: t('license.afl_3_0.description_url'),
      permissions: [t('license.info.commercial_use'), t('license.info.distribution'), t('license.info.modification'), t('license.info.patent_use'), t('license.info.private_use')],
      conditions: [t('license.info.license_and_copyright_notice'), t('license.info.state_changes')],
      limitations: [t('license.info.liability'), t('license.info.trademark_use'), t('license.info.warranty')],
    },
  },
  [License.OSL_3_0]: {
    name: 'Open Software License 3.0',
    url: 'https://opensource.org/licenses/OSL-3.0',
    description: {
      fromUrl: t('license.osl_3_0.description_url'),
      permissions: [t('license.info.commercial_use'), t('license.info.distribution'), t('license.info.modification'), t('license.info.patent_use'), t('license.info.private_use')],
      conditions: [t('license.info.disclose_source'), t('license.info.license_and_copyright_notice'), t('license.info.network_use_is_distribution'), t('license.info.same_license'), t('license.info.state_changes')],
      limitations: [t('license.info.liability'), t('license.info.trademark_use'), t('license.info.warranty')],
    },
  },
  [License.NPOSL_3_0]: {
    name: 'Non-Profit Open Software License 3.0',
    url: 'https://opensource.org/licenses/NPOSL-3.0',
  },
  [License.EUPL_1_1]: {
    name: 'European Union Public License 1.1',
    url: 'https://joinup.ec.europa.eu/collection/eupl/eupl-text-11-12',
    description: {
      fromUrl: t('license.eupl_1_1.description_url'),
      permissions: [t('license.info.commercial_use'), t('license.info.distribution'), t('license.info.modification'), t('license.info.patent_use'), t('license.info.private_use')],
      conditions: [t('license.info.disclose_source'), t('license.info.license_and_copyright_notice'), t('license.info.network_use_is_distribution'), t('license.info.same_license'), t('license.info.state_changes')],
      limitations: [t('license.info.liability'), t('license.info.trademark_use'), t('license.info.warranty')],
    },
  },
  [License.EUPL_1_2]: {
    name: 'European Union Public License 1.2',
    url: 'https://joinup.ec.europa.eu/collection/eupl/eupl-text-11-12',
    description: {
      fromUrl: t('license.eupl_1_2.description_url'),
      permissions: [t('license.info.commercial_use'), t('license.info.distribution'), t('license.info.modification'), t('license.info.patent_use'), t('license.info.private_use')],
      conditions: [t('license.info.disclose_source'), t('license.info.license_and_copyright_notice'), t('license.info.network_use_is_distribution'), t('license.info.same_license'), t('license.info.state_changes')],
      limitations: [t('license.info.liability'), t('license.info.trademark_use'), t('license.info.warranty')],
    },
  },
  [License.CECILL_2_1]: {
    name: 'CeCILL License 2.1',
    url: 'http://www.cecill.info/licences/Licence_CeCILL_V2.1-en.html',
  },
  [License.CECILL_B]: {
    name: 'CeCILL-B License',
    url: 'http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.html',
  },
  [License.CECILL_C]: {
    name: 'CeCILL-C License',
    url: 'http://www.cecill.info/licences/Licence_CeCILL-C_V1-en.html',
  },
  [License.SOLDERPAD_1_1]: {
    name: 'Solderpad License 1.1',
    url: 'https://solderpad.org/licenses/SHL-1.1/',
  },
  [License.APACHE_1_1]: {
    name: 'Apache License 1.1',
    url: 'https://apache.org/licenses/LICENSE-1.1',
  },
  [License.OPEN_FONT_1_1]: {
    name: 'SIL Open Font License 1.1',
    url: 'https://opensource.org/licenses/OFL-1.1',
    description: {
      fromUrl: t('license.open_font_1_1.description_url'),
      permissions: [t('license.info.commercial_use'), t('license.info.distribution'), t('license.info.modification'), t('license.info.private_use')],
      conditions: [t('license.info.license_and_copyright_notice'), t('license.info.same_license')],
      limitations: [t('license.info.liability'), t('license.info.warranty')],
    },
  },
  [License.MS_PL]: {
    name: 'Microsoft Public License',
    url: 'https://opensource.org/licenses/MS-PL',
    description: {
      fromUrl: t('license.ms_pl.description_url'),
      permissions: [t('license.info.commercial_use'), t('license.info.distribution'), t('license.info.modification'), t('license.info.patent_use'), t('license.info.private_use')],
      conditions: [t('license.info.license_and_copyright_notice')],
      limitations: [t('license.info.trademark_use'), t('license.info.warranty')],
    },
  },
  [License.MS_RL]: {
    name: 'Microsoft Reciprocal License',
    url: 'https://opensource.org/licenses/MS-RL',
    description: {
      fromUrl: t('license.ms_rl.description_url'),
      permissions: [t('license.info.commercial_use'), t('license.info.distribution'), t('license.info.modification'), t('license.info.patent_use'), t('license.info.private_use')],
      conditions: [t('license.info.disclose_source'), t('license.info.license_and_copyright_notice'), t('license.info.same_license_file')],
      limitations: [t('license.info.trademark_use'), t('license.info.warranty')],
    },
  },
  [License.OTHER]: {
    name: 'Other',
    url: '',
  },
}
