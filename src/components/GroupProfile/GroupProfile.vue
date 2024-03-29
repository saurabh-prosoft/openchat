<script setup>
import { watch, onBeforeUnmount, ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';

import { trapBetween, trapFocus } from '@/utils/utils';
import { useStorageStore } from '@/stores/storage';
import { useGroupsStore } from '@/stores/groups';
import { useAuthStore } from '@/stores/auth';
import { useUsersStore } from '@/stores/users';
import { nameRegex } from '@/utils/constants';
import Button from '@/components/Common/Button/Button.vue';
import InputText from '@/components/Common/InputText/InputText.vue';
import AvatarSelector from '@/components/AvatarSelector/AvatarSelector.vue';
import Icon from '../Common/Icon/Icon.vue';
import Modal from '../Common/Modal/Modal.vue';
import GroupMemberList from '@/components/GroupMemberList/GroupMemberList.vue';
import EditGroup from '../EditGroup/EditGroup.vue';

const router = useRouter();
const storage = useStorageStore();
const groups = useGroupsStore();
const auth = useAuthStore();
const users = useUsersStore();
const el = ref(null);
const bound = ref(null);
const nameEl = ref(null);
const name = ref(null);
const editing = ref(false);
const showConfirm = ref(null);
const showManage = ref(false);
const group = ref(groups.activeGroup);
const isPrivate = computed(() => group.value.type === 'private');
const isAdmin = computed(() => group.value.id !== 'self' && group.value.admins.includes(auth.user.uid));
const avatarUrl = computed(() => {
  let url = group.value.avatarUrl;
  if (group.value.id === 'self') url = auth.profile?.avatarUrl;
  else if (group.value.type === 'private') {
    const otherUserId = group.value.members.find((id) => id !== auth.user.uid);
    url = users.users[otherUserId]?.avatarUrl;
  }
  return url || `/assets/icons/avatar${group.value.type === 'broadcast' ? '-group' : ''}.png`;
});

const keyListener = (event) => trapFocus(event, el.value, bound.value);

const validateName = (val) => {
  if (!val) return 'Provide a name';
  if (!nameRegex.test(val)) {
    return 'Enter a valid name';
  }
  return null;
};
const handleUpdate = async (field, args) => {
  let res = false;
  if (field === 'name') {
    if (nameEl.value.validate(name.value)) return false;
    res = await groups.updateGroup(group.value.id, { name: name.value });
    editing.value = !res;
    if (res) group.value.name = name.value;
  } else if (field === 'avatar') {
    const { blob } = args;
    await storage.uploadFile(blob, `groups/${group.value.id}/profile.png`, { contentType: 'image/png' });
    const url = await storage.getUrlFromPath(`groups/${group.value.id}/profile.png`);
    res = await groups.updateGroup(group.value.id, { avatarUrl: url });
    if (res) group.value.avatarUrl = url;
  }
  return false;
};
const handleControl = (action) => {
  showConfirm.value = action === 'leave' ? { title: 'Leave group', action: handleLeave } : null;
};
const handleLeave = async () => {
  await groups.leave(group.value);
};

watch(el, () => {
  if (el.value) {
    bound.value = trapBetween(el.value);
    window.addEventListener('keydown', keyListener);
  }
});
watch(
  () => groups.activeGroup,
  () => {
    if (!groups.activeGroup) return;
    group.value = groups.activeGroup;
    name.value = group.value.name;
  }
);
onMounted(() => {
  document.activeElement?.blur();
  name.value = group.value.name;
});
onBeforeUnmount(() => window.removeEventListener('keydown', keyListener));
</script>

<template>
  <aside ref="el" class="group-profile">
    <Modal
      v-if="!!showConfirm"
      :title="showConfirm.title"
      :controls="[{ text: 'Yes', async: true, action: showConfirm.action }, { text: 'Cancel' }]"
      @dismiss="() => (showConfirm = null)"
    >
      Are you sure ?
    </Modal>
    <header>
      <Button
        @click="() => router.back()"
        :size="1.2"
        icon="back"
        :complementary="false"
        :adaptive="false"
        circular
        flat
      />
      <h2 class="ml-1 c-black">Profile</h2>
    </header>
    <main>
      <AvatarSelector
        :disabled="isPrivate || !isAdmin"
        :url="avatarUrl"
        :updater="async (blob) => handleUpdate('avatar', { blob })"
      />
      <section class="name">
        <Transition name="fade-up">
          <div v-show="!editing" class="preview">
            <h2 class="fw-lighter ellipsis">{{ name }}</h2>
            <Button
              v-if="!isPrivate && isAdmin"
              class="mt-0p25 ml-0p5"
              :size="1"
              @click="editing = true"
              icon="edit"
              :complementary="false"
              circular
              flat
            />
          </div>
        </Transition>
        <Transition name="fade-down">
          <InputText
            class="w-100p"
            v-show="editing"
            ref="nameEl"
            type="text"
            placeholder="Name"
            v-model="name"
            :attrs="{ spellcheck: false, autocomplete: 'off', disabled: isPrivate }"
            :validator="validateName"
            :action="async () => await handleUpdate('name')"
            async
          />
        </Transition>
      </section>
      <section v-if="!isPrivate" class="members">
        <GroupMemberList :group="group" :admin="isAdmin" />
      </section>
      <section v-if="!isPrivate" class="controls">
        <Button v-if="isAdmin" @click="showManage = true" icon="manage" :complementary="false" flat>
          Manage Members
        </Button>
        <Button
          v-if="group.active"
          @click="() => handleControl('leave')"
          icon="leave"
          :complementary="false"
          flat
        >
          Leave
        </Button>
      </section>
      <section class="promise">
        <Icon class="mr-0p5" name="badge-lock" alt="lock icon" adaptive />
        <span class="fw-lighter">Protected by end-to-end encryption and encryption-at-rest</span>
      </section>
      <EditGroup v-if="showManage" @back="showManage = false" :group="group" />
    </main>
  </aside>
</template>

<style scoped>
.group-profile {
  position: fixed;
  z-index: 50;
  background-color: var(--c-background-0);
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
  box-shadow: 0 0 10px 0px var(--c-shadow-0);
  display: flex;
  flex-direction: column;
}

.group-profile section {
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}

.group-profile header {
  position: sticky;
  top: 0;
  display: flex;
  padding: 1rem;
  border-bottom: 1px solid var(--c-border-1);
  background-color: var(--c-accent-light-3);
  box-shadow: 0 0 10px 0 var(--c-shadow-0);
  z-index: 1;
}
.group-profile header button {
  background-color: transparent;
}

.group-profile main {
  padding: 1rem 0 1rem 0;
  flex: 1;
  overflow-y: auto;
}

.group-profile .info {
  display: flex;
  flex-direction: column;
}

.name {
  height: 5.125rem;
}
.name .preview {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  position: absolute;
  width: 100%;
  left: 0;
}

.members {
  margin-top: 1.5rem;
  border-top: 1px solid var(--c-border-1);
  padding-bottom: 1rem;
  padding-top: 1rem;
  padding-left: 1rem !important;
  padding-right: 1rem !important;
}

.controls {
  padding-bottom: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--c-border-1);
}
.controls button {
  display: block;
  font-size: 1rem;
  padding: 0.5rem 0;
  box-shadow: none !important;
  background-color: transparent !important;
  color: #ff6565;
}
.controls button:deep(.icon-container) {
  margin-right: 0.5rem;
  filter: invert(69%) sepia(28%) saturate(5520%) hue-rotate(319deg) brightness(100%) contrast(100%);
}

.promise {
  padding-top: 1rem;
  padding-bottom: 1rem;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}
.promise:deep(.icon-container) {
  margin-top: 0.2rem;
  font-size: 0;
  color: var(--c-text-2);
  filter: invert(77%) sepia(82%) saturate(2090%) hue-rotate(209deg) brightness(90%) contrast(88%);
}

@media (min-width: 768px) {
  .group-profile {
    width: 390px;
    left: unset;
    right: 0;
  }
}
@media (min-width: 1024px) {
  .group-profile {
    width: 425px;
    left: unset;
    right: 0;
  }
}
</style>
