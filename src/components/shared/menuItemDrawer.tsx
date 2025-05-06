import { useState } from "react"
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "../ui/drawer"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select"
import { Switch } from "../ui/switch"

export function DrawerAddMenuItem({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("lunch")
  const [price, setPrice] = useState("")
  const [isAvailable, setIsAvailable] = useState(true)

  const handleSubmit = () => {
    if (!name || !category || !price) return alert("Please fill all required fields.")
    onSubmit({ name, description, category, price: parseFloat(price), is_available: isAvailable })
  }

  return (
    <Drawer>
      <DrawerTrigger className="w-full" asChild>
        <Button className="w-full bg-[#2b2b2b] text-[#00bfff]">Add Menu Item</Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-md p-4">
          <DrawerHeader>
            <DrawerTitle>Add New Menu Item</DrawerTitle>
            <DrawerDescription></DrawerDescription>
          </DrawerHeader>

          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Chicken Sandwich" />
            </div>

            <div>
              <Label>Description</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional" />
            </div>

            <div>
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="w-full">
                  <SelectItem value="breakfast">Breakfast</SelectItem>
                  <SelectItem value="lunch">Lunch</SelectItem>
                  <SelectItem value="dinner">Dinner</SelectItem>
                  <SelectItem value="snacks">Snacks</SelectItem>
                  <SelectItem value="drinks">Drinks</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Price (Tsh)</Label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 3500"
              />
            </div>

            <div className=" items-center justify-between">
              <Label>Available?</Label>
              <Switch checked={isAvailable} onCheckedChange={setIsAvailable} />
            </div>
            <div>
                <Label>Image</Label>
                <Input type="file" accept="image/*" />
            </div>

          </div>

          <DrawerFooter className="mt-6">
            <Button onClick={handleSubmit}>Submit</Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
