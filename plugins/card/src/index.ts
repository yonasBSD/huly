// Copyright © 2025 Hardcore Engineering Inc.
//
// Licensed under the Eclipse Public License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License. You may
// obtain a copy of the License at https://www.eclipse.org/legal/epl-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//
// See the License for the specific language governing permissions and
// limitations under the License.

import { Blobs, Class, Doc, Domain, MarkupBlobRef, Mixin, Rank, Ref, Space } from '@hcengineering/core'
import { Asset, IntlString, plugin, Plugin } from '@hcengineering/platform'
import type { AnyComponent, ComponentExtensionId } from '@hcengineering/ui'

export * from './analytics'

export interface MasterTag extends Class<Card> {
  color?: number
  removed?: boolean
}

export interface Tag extends MasterTag, Mixin<Card> {}

export interface Card extends Doc {
  _class: Ref<MasterTag>
  title: string
  content: MarkupBlobRef
  blobs: Blobs
  children?: number
  attachments?: number
  parentInfo: ParentInfo[]
  parent?: Ref<Card> | null
  rank: Rank
}

export interface CardSpace extends Space {
  types: Ref<MasterTag>[]
}

export interface ParentInfo {
  _id: Ref<Card>
  _class: Ref<MasterTag>
  title: string
}

export interface MasterTagEditorSection extends Doc {
  id: string
  label: IntlString
  component: AnyComponent
  masterOnly?: boolean
}

/**
 * @public
 */
export const cardId = 'card' as Plugin

export const DOMAIN_CARD = 'card' as Domain

/**
 * @public
 */
const cardPlugin = plugin(cardId, {
  class: {
    Card: '' as Ref<Class<Card>>,
    MasterTag: '' as Ref<Class<MasterTag>>,
    Tag: '' as Ref<Class<Tag>>,
    MasterTagEditorSection: '' as Ref<Class<MasterTagEditorSection>>,
    CardSpace: '' as Ref<Class<CardSpace>>
  },
  space: {
    Default: '' as Ref<CardSpace>
  },
  types: {
    File: '' as Ref<MasterTag>,
    Document: '' as Ref<MasterTag>
  },
  icon: {
    MasterTags: '' as Asset,
    MasterTag: '' as Asset,
    Tag: '' as Asset,
    Tags: '' as Asset,
    Card: '' as Asset,
    File: '' as Asset,
    Document: '' as Asset
  },
  extensions: {
    EditCardExtension: '' as ComponentExtensionId
  },
  string: {
    MasterTag: '' as IntlString,
    MasterTags: '' as IntlString,
    Tags: '' as IntlString,
    Tag: '' as IntlString,
    Card: '' as IntlString,
    Cards: '' as IntlString,
    CardApplication: '' as IntlString
  }
})

export default cardPlugin
