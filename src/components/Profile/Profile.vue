<script setup>
import { watch, onBeforeUnmount, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

import { trapBetween, trapFocus } from '@/utils/utils';
import { useRemoteDBStore } from '@/stores/database';
import { useAuthStore } from '@/stores/auth';
import Button from '@/components/Common/Button/Button.vue';
import InputText from '@/components/Common/InputText/InputText.vue';
import AvatarSelector from '@/components/AvatarSelector/AvatarSelector.vue';

const emit = defineEmits(['back']);

const router = useRouter();
const auth = useAuthStore();
const db = useRemoteDBStore();
const el = ref(null);
const bound = ref(null);
const show = ref(false);
const nameEl = ref(null);
const phoneEl = ref(null);
const name = ref(null);
const phone = ref(null);
const naLabel = ref('Not Available');

const keyListener = (event) => trapFocus(event, el.value, bound.value);

const handleDismiss = () => {
  if (show.value) {
    window.removeEventListener('keydown', keyListener);
    show.value = false;
    router.back();
  }
};
const handleLeave = () => emit('back');
const validateName = (val) => {
  if (!val) return 'Provide a name';
  if (!/^.[^!@#$%^&*()+={}[\]`~:;"?/<>]{3,}$/.test(val)) {
    return 'Enter a valid name';
  }
  return null;
};
const handleUpdate = async (field) => {
  if (field === 'name') {
    if (nameEl.value.validate(name.value)) return false;
    return await db.updateProfile({ name: name.value });
  }
  return false;
};

let unregisterGuard = () => {};
watch(
  show,
  async (newVal, oldVal) => {
    if (oldVal !== newVal && newVal) {
      await router.push({ hash: '#profile' });

      unregisterGuard = router.beforeEach((_to, from, next) => {
        if (from.hash === '#profile') {
          window.removeEventListener('keydown', keyListener);
          show.value = false;
        }
        unregisterGuard();
        next();
      });
    }
  },
  { immediate: true }
);
watch(el, () => {
  if (el.value) {
    bound.value = trapBetween(el.value);
    window.addEventListener('keydown', keyListener);
  }
});

onMounted(() => {
  document.activeElement?.blur();
  show.value = true;
  name.value = auth.profile.name;
  phone.value = auth.profile.phone;
});
onBeforeUnmount(unregisterGuard);
</script>

<template>
  <Transition @after-leave="handleLeave" v-bind="$attrs" name="slide-left" appear>
    <aside v-if="show" ref="el" class="profile">
      <header>
        <Button @click="handleDismiss" :size="1.2" icon="back" :complementary="false" circular flat />
        <h2 class="ml-1">Profile</h2>
      </header>
      <AvatarSelector />
      <section class="info">
        <InputText
          ref="nameEl"
          type="text"
          placeholder="Name"
          v-model="name"
          :attrs="{ spellcheck: false, autocomplete: 'off' }"
          :validator="validateName"
          :action="async () => await handleUpdate('name')"
          async
        />
        <InputText
          v-if="phone"
          ref="phoneEl"
          type="text"
          placeholder="Phone"
          v-model="phone"
          :attrs="{ spellcheck: false, autocomplete: 'off' }"
          :validator="validatePhone"
        />
        <InputText v-else type="text" placeholder="Phone" v-model="naLabel" :attrs="{ disabled: true }" />
      </section>
    </aside>
  </Transition>
</template>

<style scoped>
.profile {
  position: fixed;
  z-index: 50;
  background-color: var(--c-background-0);
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
  box-shadow: 0 0 10px 0px var(--c-shadow-0);
}

.profile section {
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}

.profile header {
  display: flex;
  padding: 1rem;
  border-bottom: 1px solid var(--c-border-1);
  background-color: var(--c-accent-light-3);
}
.profile header button {
  background-color: transparent;
}

.profile .info {
  display: flex;
  flex-direction: column;
}
</style>