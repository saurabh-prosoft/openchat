<script setup>
import ChatListItem from '../ChatListItem/ChatListItem.vue';

defineProps({
  chatList: {
    type: Array,
    default: () => []
  }
});
</script>

<template>
  <section class="chat-list scroll-shadows-0 scroll-shadows">
    <ChatListItem
      :meta="{
        type: 'group',
        name: 'Test Group',
        lastMsg: { data: 'Hello World !', timestamp: '2023-12-19T10:00:00' }
      }"
    />
    <ChatListItem
      :meta="{
        type: 'private',
        name: 'Test User 1',
        lastMsg: {
          data: 'Hello World ! Hello World ! Hello World ! Hello World ! Hello World !',
          timestamp: '2023-12-15T10:00:00'
        }
      }"
    />
    <ChatListItem
      :meta="{
        type: 'private',
        name: 'Test User 2',
        lastMsg: {
          data: 'Hello World !',
          timestamp: '2023-12-10T10:00:00'
        }
      }"
    />
    <ChatListItem
      :meta="{
        type: 'group',
        name: 'Test Group',
        lastMsg: { data: 'Hello World !', timestamp: '2023-12-19T10:00:00' }
      }"
    />
    <ChatListItem
      :meta="{
        type: 'group',
        name: 'Test Group',
        lastMsg: { data: 'Hello World !', timestamp: '2023-12-19T10:00:00' }
      }"
    />
    <ChatListItem
      :meta="{
        type: 'group',
        name: 'Test Group',
        lastMsg: { data: 'Hello World !', timestamp: '2023-12-19T10:00:00' }
      }"
    />
    <ChatListItem
      :meta="{
        type: 'group',
        name: 'Test Group',
        lastMsg: { data: 'Hello World !', timestamp: '2023-12-19T10:00:00' }
      }"
    />
    <ChatListItem
      :meta="{
        type: 'group',
        name: 'Test Group',
        lastMsg: { data: 'Hello World !', timestamp: '2023-12-19T10:00:00' }
      }"
    />
    <ChatListItem
      :meta="{
        type: 'group',
        name: 'Test Group',
        lastMsg: { data: 'Hello World !', timestamp: '2023-12-19T10:00:00' }
      }"
    />
    <ChatListItem
      :meta="{
        type: 'group',
        name: 'Test Group',
        lastMsg: { data: 'Hello World !', timestamp: '2023-12-19T10:00:00' }
      }"
    />
    <ChatListItem
      :meta="{
        type: 'group',
        name: 'Test Group',
        lastMsg: { data: 'Hello World !', timestamp: '2023-12-19T10:00:00' }
      }"
    />
    <ChatListItem
      :meta="{
        type: 'group',
        name: 'Test Group',
        lastMsg: { data: 'Hello World !', timestamp: '2023-12-19T10:00:00' }
      }"
    />
    <ChatListItem
      :meta="{
        type: 'group',
        name: 'Test Group',
        lastMsg: { data: 'Hello World !', timestamp: '2023-12-19T10:00:00' }
      }"
    />
  </section>
</template>

<style scoped>
.chat-list {
  height: calc(100vh - var(--header-height) - 3.25rem);
}
</style>