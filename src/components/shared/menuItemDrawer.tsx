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
  const [image, setImage] = useState<File | null>(null)
  const [isAvailable, setIsAvailable] = useState(true)

  const handleSubmit = () => {
    if (!name || !category || !price) return alert("Please fill all required fields.")
    if (!image) return alert("Please upload an image.")
    onSubmit({ name, description, image, category, price: parseFloat(price), is_available: isAvailable })
    alert("Menu item added successfully.")
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
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Chicken Sandwich" />
            </div>

            <div>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
            </div>

            <div>
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
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="3500"
              />
            </div>

            <div className="flex items-center">
              <Label className="pr-2">Available?</Label>
              <Switch  checked={isAvailable} onCheckedChange={setIsAvailable} />
            </div>
            <div>
                <Label>Image</Label>
                <input
                  type="file"
                  accept="image/*"
                  className="block pt-2 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#2b2b2b] file:text-[#00bfff] hover:file:bg-[#1a1a1a]"
                  onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
                />
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
