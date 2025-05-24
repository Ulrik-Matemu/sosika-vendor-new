import { useState, useEffect, useRef, } from "react"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "../components/ui/tabs"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select"
import { toast, Toaster } from "sonner"


export function InstallPWAButton() {
    const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setVisible(true);
        };
        window.addEventListener("beforeinstallprompt", handler as EventListener);
        return () => {
            window.removeEventListener("beforeinstallprompt", handler as EventListener);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        // @ts-ignore
        deferredPrompt.prompt();
        // @ts-ignore
        const { outcome } = await deferredPrompt.userChoice || {};
        setDeferredPrompt(null);
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <Button variant="default" onClick={handleInstallClick}>
            Install App
        </Button>
    );
}

export function TabsDemo() {
    const [geolocation, setLocation] = useState("");
    const [selectedValue, setSelectedValue] = useState<string | undefined>("");

    const handleValueChange = (value: string) => {
      setSelectedValue(value);
    };

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser")
            return
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const coords = `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`
                setLocation(coords)
            },
            (error) => {
                alert("Unable to retrieve location: " + error.message)
            }
        )
    }


    const handleLogin = async () => {
        const vendorName = (document.getElementById("vendor-name") as HTMLInputElement).value;
        const password = (document.getElementById("password") as HTMLInputElement).value;
        try {
            const response = await fetch('https://sosika-backend.onrender.com/api/vendor/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: vendorName,
                    password: password,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setTimeout(() => {
                    localStorage.setItem("vendorId", data.vendorId);
                    localStorage.setItem("vendorName", vendorName);
                    localStorage.setItem("token", data.token);
                    window.location.href = "/dashboard";
                }, 1500);
            } else {
                throw new Error(data.error || 'Login failed');
            }
        } catch (error) {
            console.error('Login Error:', error);
            if (error instanceof Error) {
                alert(error.message);
            } else {
                alert('An unknown error occurred');
            }
        }
    }

    const handleRegister = async () => {
        const name = (document.getElementById("shopName") as HTMLInputElement).value;
        const ownerName = (document.getElementById("ownerName") as HTMLInputElement).value;
        const collegeId = selectedValue;
        const password = (document.getElementById("vendorPassword") as HTMLInputElement).value;

        try {
            const response = await fetch("https://sosika-backend.onrender.com/api/vendor/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    ownerName,
                    collegeId,
                    geolocation,
                    password,
                }),
            })


            if (response.ok) {
                setTimeout(() => {
                    window.location.href = "/login";
                    toast("Account created successfully! Please login.");
                }, 1500);
            }
        } catch(error) {
            console.error("Registration Error:", error);
            if (error instanceof Error) {
                alert(error.message);
            } else {
                alert("An unknown error occurred");
            }
        } 
    }
    
    
    return (
        <>
        <Toaster />
        <div className="flex justify-center items-center min-h-screen px-4">
            <Tabs defaultValue="login" className="w-full max-w-sm">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="signup">Create Account</TabsTrigger>
                </TabsList>
    
                {/* Login Tab */}
                <TabsContent value="login">
                    <Card>
                        <CardHeader>
                            <CardTitle>Login</CardTitle>
                            <CardDescription>Access your account</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <Label htmlFor="name">Vendor Name</Label>
                                <Input id="vendor-name" type="name" placeholder="Sosika Snacks"  />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" type="password"  placeholder="••••••••" />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" onClick={handleLogin}>Login</Button>
                           
                        </CardFooter>
                    </Card>
                </TabsContent>
    
                {/* Sign Up Tab */}
                <TabsContent value="signup">
                    <Card>
                        <CardHeader>
                            <CardTitle>Create Account</CardTitle>
                            <CardDescription>Register your vendor shop below.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <Label htmlFor="shopName">Shop Name</Label>
                                <Input id="shopName" placeholder="e.g. Taste Bites" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="ownerName">Owner Name</Label>
                                <Input id="ownerName" placeholder="e.g. John Doe" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="college">College</Label>
                                <Select onValueChange={handleValueChange}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="IAA" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>College</SelectLabel>
                                            <SelectItem value="1">IAA</SelectItem>
                                            <SelectItem value="2">Not In College</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="location">Geolocation</Label>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        className={`w-full ${geolocation ? "bg-green-600 hover:bg-green-700" : ""}`}
                                        onClick={handleGetLocation}
                                    >
                                        {geolocation ? "Location Set ✅" : "Get Location"}
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="vendorPassword">Password</Label>
                                <Input id="vendorPassword" type="password" placeholder="Create a password" />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" onClick={handleRegister}>Create Account</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
                
    
            </Tabs>
            
            
        </div>
       
        </>
    )

}


