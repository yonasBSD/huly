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
  import { showPopup, HeaderButton } from '@hcengineering/ui'
  import lead from '../plugin'
  import CreateCustomer from './CreateCustomer.svelte'
  import { AccountRole } from '@hcengineering/core'
  import { getClient } from '@hcengineering/presentation'

  const client = getClient()

  async function newIssue (): Promise<void> {
    showPopup(CreateCustomer, {}, 'top')
  }
</script>

<HeaderButton
  {client}
  mainActionId={lead.string.CreateCustomerLabel}
  visibleActions={[lead.string.CreateCustomerLabel]}
  actions={[
    {
      id: lead.string.CreateCustomerLabel,
      label: lead.string.CreateCustomerLabel,
      accountRole: AccountRole.User,
      callback: newIssue
    }
  ]}
/>
