<!--
// Copyright © 2020, 2021 Anticrm Platform Contributors.
// Copyright © 2021 Hardcore Engineering Inc.
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
-->
<script lang="ts">
  import { Channel, Person, PersonAccount, combineName, getFirstName, getLastName } from '@hcengineering/contact'
  import { AccountRole, Ref, getCurrentAccount, hasAccountRole } from '@hcengineering/core'
  import { AttributeEditor, createQuery, getClient } from '@hcengineering/presentation'
  import setting, { IntegrationType } from '@hcengineering/setting'
  import { EditBox, FocusHandler, Scroller, createFocusManager } from '@hcengineering/ui'
  import { createEventDispatcher, onMount } from 'svelte'
  import contact from '../plugin'
  import ChannelsEditor from './ChannelsEditor.svelte'
  import EditableAvatar from './EditableAvatar.svelte'
  import Avatar from './Avatar.svelte'
  import ChannelsDropdown from './ChannelsDropdown.svelte'

  export let object: Person
  export let readonly: boolean = false
  export let channels: Channel[] | undefined = undefined

  const client = getClient()
  const h = client.getHierarchy()

  const account = getCurrentAccount() as PersonAccount
  $: owner = account.person === object._id

  function isEditable (owner: boolean, object: Person): boolean {
    if (owner) return true
    if (!h.hasMixin(object, contact.mixin.Employee)) return true
    return hasAccountRole(account, AccountRole.Maintainer)
  }
  $: editable = !readonly && isEditable(owner, object)

  let avatarEditor: EditableAvatar

  let firstName = getFirstName(object.name)
  let lastName = getLastName(object.name)

  $: setName(object)

  function setName (object: Person): void {
    firstName = getFirstName(object.name)
    lastName = getLastName(object.name)
  }

  const dispatch = createEventDispatcher()

  async function firstNameChange (): Promise<void> {
    await client.update(object, {
      name: combineName(firstName, getLastName(object.name))
    })
  }

  async function lastNameChange (): Promise<void> {
    await client.update(object, {
      name: combineName(getFirstName(object.name), lastName)
    })
  }

  let integrations: Set<Ref<IntegrationType>> = new Set<Ref<IntegrationType>>()
  const settingsQuery = createQuery()
  $: settingsQuery.query(setting.class.Integration, { createdBy: account._id, disabled: false }, (res) => {
    integrations = new Set(res.map((p) => p.type))
  })

  const sendOpen = () => dispatch('open', { ignoreKeys: ['comments', 'name', 'channels', 'city'] })
  onMount(sendOpen)

  async function onAvatarDone (): Promise<void> {
    if (object.avatar != null) {
      await avatarEditor.removeAvatar(object.avatar)
    }
    const avatar = await avatarEditor.createAvatar()
    await client.diffUpdate(object, avatar)
  }

  const manager = createFocusManager()
</script>

<FocusHandler {manager} />

{#if object !== undefined}
  <div class="flex-row-stretch flex-grow">
    <div class="flex-no-shrink mr-8">
      {#key object}
        {#if editable}
          <EditableAvatar
            person={object}
            size={'x-large'}
            name={object.name}
            bind:this={avatarEditor}
            on:done={onAvatarDone}
          />
        {:else}
          <Avatar person={object} size={'x-large'} name={object.name} />
        {/if}
      {/key}
    </div>
    <div class="flex-grow flex-col">
      <div class="name">
        <EditBox
          placeholder={contact.string.PersonFirstNamePlaceholder}
          disabled={!editable}
          bind:value={firstName}
          on:change={firstNameChange}
          focusIndex={1}
        />
      </div>
      <div class="name">
        <EditBox
          disabled={!editable}
          placeholder={contact.string.PersonLastNamePlaceholder}
          bind:value={lastName}
          on:change={lastNameChange}
          focusIndex={2}
        />
      </div>
      <div class="location">
        <AttributeEditor maxWidth="20rem" _class={contact.class.Person} {object} {editable} key="city" focusIndex={3} />
      </div>

      <div class="separator" />
      <Scroller
        contentDirection={'horizontal'}
        padding={'.125rem .125rem .5rem'}
        noStretch
        stickedScrollBars
        thinScrollBars
      >
        {#if channels === undefined}
          <ChannelsEditor
            attachedTo={object._id}
            attachedClass={object._class}
            {editable}
            bind:integrations
            shape={'circle'}
            focusIndex={10}
          />
        {:else}
          <ChannelsDropdown
            value={channels}
            editable={false}
            kind={'link-bordered'}
            size={'small'}
            length={'full'}
            shape={'circle'}
          />
        {/if}
      </Scroller>
    </div>
  </div>
{/if}

<style lang="scss">
  .name {
    font-weight: 500;
    font-size: 1.25rem;
    color: var(--theme-caption-color);
  }
  .location {
    margin-top: 0.25rem;
    font-size: 0.75rem;
  }

  .separator {
    margin: 1rem 0;
    height: 1px;
    background-color: var(--theme-divider-color);
  }
</style>
