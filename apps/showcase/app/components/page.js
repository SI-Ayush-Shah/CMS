import { Button } from "@repo/ui/button";
import { Tabs } from "@repo/ui/tabs";
import { Input } from "@repo/ui/input";
import { Badge } from "@repo/ui/badge";
import { Checkbox } from "@repo/ui/checkbox";

export default function ComponentsPage() {
  return (
    <main className="p-10 flex flex-col gap-10">
      <h1 className="text-h1 leading-h1 font-bold text-main-high">
        Components
      </h1>

      <section id="buttons" className="flex flex-col gap-4">
        <h2 className="text-h2 leading-h2 font-medium text-main-high">
          Buttons
        </h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="solid" size="md" className="font-bold">
            Primary
          </Button>
          <Button variant="outline" size="md">
            Outline
          </Button>
          <Button variant="ghost" size="md">
            Ghost
          </Button>
        </div>
      </section>

      <section id="inputs" className="flex flex-col gap-4">
        <h2 className="text-h2 leading-h2 font-medium text-main-high">
          Inputs
        </h2>
        <div className="flex flex-col gap-3 max-w-md">
          <Input placeholder="Placeholder" hint="Helper text" />
          <Input placeholder="Invalid" invalid />
          <Input placeholder="With error" error="This field is required" />
        </div>
        <div className="flex items-center gap-4 mt-2">
          <Checkbox label="Subscribe" defaultChecked />
          <Checkbox label="Accept terms" />
        </div>
      </section>

      <section id="feedback" className="flex flex-col gap-4">
        <h2 className="text-h2 leading-h2 font-medium text-main-high">
          Feedback
        </h2>
        <div className="flex flex-wrap gap-4 items-center">
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="error">Error</Badge>
          <Badge variant="primary">New</Badge>
        </div>
      </section>

      <section id="tabs" className="flex flex-col gap-4">
        <h2 className="text-h2 leading-h2 font-medium text-main-high">Tabs</h2>
        <Tabs
          items={[
            {
              id: "custom",
              label: "Custom",
              panel: (
                <div className="p-4 rounded-2xl border border-default">
                  Custom content
                </div>
              ),
            },
            {
              id: "default",
              label: "Default",
              panel: (
                <div className="p-4 rounded-2xl border border-default">
                  Default content
                </div>
              ),
            },
          ]}
          defaultTabId="custom"
        />
      </section>
    </main>
  );
}
