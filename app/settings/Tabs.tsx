import { TabsItems, TabsComponent } from '@/components/Tabs';

type TabsNames =
  | 'users'
  | 'create-user'
  | 'create-service-tariff'
  | 'create-service'
  | 'token'
  | 'manager-service';

const tabsItems: TabsItems<TabsNames>[] = [
  {
    label: 'Usuários',
    href: '/settings/users',
    value: 'users'
  },
  {
    label: 'Criar Usuário',
    href: '/settings/users/create',
    value: 'create-user'
  },
  {
    label: 'Criar Tarifa',
    href: '/settings/tariffs/service-tariff/create/page',
    value: 'create-service-tariff'
  },
  {
    label: 'Criar Serviço',
    href: '/settings/tariffs/service/create/page',
    value: 'create-service'
  },
  {
    label: 'Gerar Token',
    href: '/settings/tokens',
    value: 'token'
  },
  {
    label: 'Gerenciar Serviços',
    href: '/settings/tariffs/service/manager',
    value: 'manager-service'
  }
];

const SettingsTabs = (props: {
  defaultValue: TabsNames;
  children: React.ReactNode;
}) => {
  const { defaultValue, children } = props;
  return (
    <TabsComponent defaultValue={defaultValue} tabsItems={tabsItems}>
      {children}
    </TabsComponent>
  );
};

export default SettingsTabs;
