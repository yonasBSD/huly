<!--
// Copyright © 2022 Hardcore Engineering Inc.
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
  import {
    AccountRole,
    Class,
    Doc,
    DocumentQuery,
    FindOptions,
    getCurrentAccount,
    hasAccountRole,
    Ref,
    Space,
    WithLookup
  } from '@hcengineering/core'
  import { Asset, IntlString } from '@hcengineering/platform'
  import { getClient, ComponentExtensions } from '@hcengineering/presentation'
  import {
    AnyComponent,
    Breadcrumb,
    Button,
    Component,
    Header,
    IconAdd,
    IModeSelector,
    Loading,
    ModeSelector,
    SearchInput,
    showPopup
  } from '@hcengineering/ui'
  import { Viewlet, ViewletDescriptor, ViewletPreference, ViewOptions } from '@hcengineering/view'
  import {
    FilterBar,
    FilterButton,
    getResultOptions,
    getResultQuery,
    ViewletSelector,
    ViewletSettingButton
  } from '@hcengineering/view-resources'
  import workbench, { ParentsNavigationModel } from '@hcengineering/workbench'
  import ComponentNavigator from './ComponentNavigator.svelte'

  export let _class: Ref<Class<Doc>>
  export let space: Ref<Space> | undefined = undefined
  export let icon: Asset
  export let label: IntlString
  export let createEvent: string | undefined = undefined
  export let createLabel: IntlString | undefined = undefined
  export let createComponent: AnyComponent | undefined = undefined
  export let createComponentProps: Record<string, any> = {}
  export let createComponentAccess: AccountRole | undefined = undefined
  export let createButton: AnyComponent | undefined = undefined
  export let isCreationDisabled = false
  export let descriptors: Array<Ref<ViewletDescriptor>> | undefined = undefined
  export let baseQuery: DocumentQuery<Doc> | undefined = undefined
  export let modes: IModeSelector<any> | undefined = undefined
  export let navigationModel: ParentsNavigationModel | undefined = undefined
  export let actionConfig: Record<string, any> = {}
  export let actionVisible: boolean = false

  const client = getClient()
  const hierarchy = client.getHierarchy()

  let search = ''
  let viewlet: WithLookup<Viewlet> | undefined
  let filterVisible: boolean = false
  let preference: ViewletPreference | undefined
  let viewlets: Array<WithLookup<Viewlet>> = []
  let viewOptions: ViewOptions | undefined

  $: _baseQuery = { ...(baseQuery ?? {}), ...(viewlet?.baseQuery ?? {}) }
  $: query = { ..._baseQuery }
  $: searchQuery = search === '' ? query : { ...query, $search: search }
  $: resultQuery = searchQuery

  let options = viewlet?.options

  $: void updateQuery(_baseQuery, viewOptions, viewlet)
  $: void updateOptions(viewlet?.options, viewOptions, viewlet)

  async function updateOptions (
    _options: FindOptions<Doc> | undefined,
    viewOptions: ViewOptions | undefined,
    viewlet: Viewlet | undefined
  ): Promise<void> {
    options = await getResultOptions(_options, viewlet?.viewOptions?.other, viewOptions)
  }

  async function updateQuery (
    initialQuery: DocumentQuery<Doc>,
    viewOptions: ViewOptions | undefined,
    viewlet: Viewlet | undefined
  ): Promise<void> {
    query =
      viewOptions !== undefined && viewlet !== undefined
        ? await getResultQuery(hierarchy, initialQuery, viewlet.viewOptions?.other, viewOptions)
        : initialQuery
  }

  function showCreateDialog (): void {
    if (createComponent === undefined) return
    showPopup(createComponent, { ...createComponentProps, space }, 'top')
  }
</script>

<Header
  adaptive={modes !== undefined ? 'doubleRow' : filterVisible ? 'freezeActions' : 'disabled'}
  hideActions={!(createLabel && createComponent) && createButton === undefined}
  hideExtra={modes === undefined}
  freezeBefore
>
  <svelte:fragment slot="beforeTitle">
    <ViewletSelector
      bind:viewlet
      bind:preference
      bind:viewlets
      ignoreFragment
      viewletQuery={{
        attachTo: _class,
        variant: { $exists: false },
        ...(descriptors !== undefined ? { descriptor: { $in: descriptors } } : {})
      }}
    />
    <ViewletSettingButton bind:viewOptions bind:viewlet />
  </svelte:fragment>

  <Breadcrumb {icon} {label} size={'large'} isCurrent />

  <svelte:fragment slot="search">
    <SearchInput bind:value={search} collapsed />
    <FilterButton {_class} bind:visible={filterVisible} />
  </svelte:fragment>
  <svelte:fragment slot="actions">
    <ComponentExtensions
      extension={workbench.extensions.SpecialViewAction}
      props={{ _class, visible: actionVisible, query: resultQuery, config: actionConfig }}
    />
    {#if createComponentAccess === undefined || hasAccountRole(getCurrentAccount(), createComponentAccess)}
      {#if createLabel && createComponent}
        <Button
          icon={IconAdd}
          label={createLabel}
          kind={'primary'}
          disabled={isCreationDisabled}
          event={createEvent}
          on:click={() => {
            showCreateDialog()
          }}
        />
      {:else if createButton !== undefined}
        <Component
          is={createButton}
          props={{
            ...createComponentProps,
            space
          }}
        />
      {/if}
    {/if}
  </svelte:fragment>
  <svelte:fragment slot="extra">
    {#if modes !== undefined}
      <ModeSelector kind={'subtle'} props={modes} />
    {/if}
  </svelte:fragment>
</Header>

{#if !viewlet?.$lookup?.descriptor?.component || viewlet?.attachTo !== _class || (preference !== undefined && viewlet?._id !== preference.attachedTo)}
  <Loading />
{:else if viewOptions && viewlet}
  <FilterBar
    {_class}
    {space}
    query={searchQuery}
    {viewOptions}
    on:change={(e) => {
      resultQuery = { ...query, ...e.detail }
    }}
  />
  {#if navigationModel?.navigationComponent === undefined}
    <Component
      is={viewlet.$lookup.descriptor.component}
      props={{
        _class,
        space,
        options,
        config: preference?.config ?? viewlet.config,
        viewlet,
        viewOptions,
        viewOptionsConfig: viewlet.viewOptions?.other,
        createItemDialog: createComponent,
        createItemLabel: createLabel,
        query: resultQuery,
        totalQuery: query,
        ...viewlet.props
      }}
    />
  {:else}
    <ComponentNavigator
      query={resultQuery}
      {space}
      mainComponent={viewlet.$lookup.descriptor.component}
      mainComponentProps={{
        _class,
        space,
        options,
        config: preference?.config ?? viewlet.config,
        viewlet,
        viewOptions,
        viewOptionsConfig: viewlet.viewOptions?.other,
        createItemDialog: createComponent,
        createItemLabel: createLabel,
        query: resultQuery,
        totalQuery: query,
        ...viewlet.props
      }}
      {...navigationModel}
    />
  {/if}
{/if}
