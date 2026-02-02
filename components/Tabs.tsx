import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export interface TabsItems<TabsNames> {
  label: string;
  href: string;
  value: TabsNames;
}

export const TabsComponent = <TabsNames extends string>(props: {
  defaultValue: TabsNames;
  tabsItems: TabsItems<TabsNames>[];
  children: React.ReactNode;
}) => {
  const { defaultValue, tabsItems, children } = props;
  return (
    <Tabs defaultValue={defaultValue} className="flex flex-col">
      <div className="flex items-center mt-2 mb-0">
        <ScrollArea className="h-[70px] w-[350px] sm:w-[400px] md:w-[500px] lg:w-[600px] xl:w-[700px] rounded-md ">
          <TabsList>
            {tabsItems.map((tab) => (
              <TabsTrigger key={tab.href} value={tab.value} asChild>
                <Link href={tab.href} prefetch={true} passHref>
                  {tab.label}
                </Link>
              </TabsTrigger>
            ))}
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
      {tabsItems.map((tab) => (
        <TabsContent key={tab.href} value={tab.value}>
          {children}
        </TabsContent>
      ))}
    </Tabs>
  );
};
