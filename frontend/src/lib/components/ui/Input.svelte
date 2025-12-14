<script lang="ts">
  let {
    label,
    type = 'text',
    name,
    id = name || crypto.randomUUID(),
    value = $bindable(''),
    placeholder = '',
    required = false,
    disabled = false,
    icon = '',
    class: className = ''
  }: {
    label?: string;
    type?: 'text' | 'email' | 'password' | 'number';
    name?: string;
    id?: string;
    value?: string | number;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    icon?: string;
    class?: string;
  } = $props();
</script>

<div class="w-full {className}">
  {#if label}
    <label for={id} class="block text-sm font-medium text-gray-700 mb-2">
      {label}{#if required}<span class="text-red-500 ml-0.5">*</span>{/if}
    </label>
  {/if}
  <div class="relative">
    {#if icon}
      <div class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
        {icon}
      </div>
    {/if}
    <input
      {id}
      {type}
      {name}
      bind:value
      {placeholder}
      {required}
      {disabled}
      class="w-full {icon ? 'pl-10' : 'px-4'} pr-4 py-3 text-sm bg-white border border-gray-200 rounded-xl
             focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
             disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
             placeholder:text-gray-400 transition-all duration-200
             hover:border-gray-300"
    />
  </div>
</div>

