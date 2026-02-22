import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useCreateListing } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { X, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ExternalBlob, Category } from '../../backend';
import { parseINRInput } from '../../utils/currency';
import { sanitizeInput } from '../../utils/security';

export default function CreateListingForm() {
  const navigate = useNavigate();
  const createListing = useCreateListing();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<Category | ''>('');
  const [location, setLocation] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [images, setImages] = useState<ExternalBlob[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<number, number>>({});

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: ExternalBlob[] = [];
    const fileArray = Array.from(files);

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      const bytes = new Uint8Array(await file.arrayBuffer());
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((percentage) => {
        setUploadProgress((prev) => ({ ...prev, [images.length + i]: percentage }));
      });
      newImages.push(blob);
    }

    setImages((prev) => [...prev, ...newImages]);
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setUploadProgress((prev) => {
      const newProgress = { ...prev };
      delete newProgress[index];
      return newProgress;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Sanitize inputs
    const sanitizedTitle = sanitizeInput(title.trim());
    const sanitizedDescription = sanitizeInput(description.trim());
    const sanitizedLocation = sanitizeInput(location.trim());
    const sanitizedContactInfo = sanitizeInput(contactInfo.trim());

    if (!sanitizedTitle || !sanitizedDescription || !price || !category || !sanitizedLocation || !sanitizedContactInfo) {
      toast.error('Please fill in all required fields');
      return;
    }

    const priceValue = parseINRInput(price);
    if (!priceValue || priceValue < BigInt(0)) {
      toast.error('Please enter a valid price');
      return;
    }

    try {
      await createListing.mutateAsync({
        title: sanitizedTitle,
        description: sanitizedDescription,
        price: priceValue,
        category: category as Category,
        location: sanitizedLocation,
        images,
        contactInfo: sanitizedContactInfo,
      });

      toast.success('Listing created successfully!');
      navigate({ to: '/dashboard' });
    } catch (error) {
      console.error('Error creating listing:', error);
      toast.error('Failed to create listing. Please try again.');
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="e.g., iPhone 13 Pro Max"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe your item in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              required
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price">Price (INR) *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  placeholder="1999"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="pl-8"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={category} onValueChange={(value) => setCategory(value as Category)}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="vehicles">Vehicles</SelectItem>
                  <SelectItem value="realEstate">Real Estate</SelectItem>
                  <SelectItem value="furniture">Furniture</SelectItem>
                  <SelectItem value="fashion">Fashion</SelectItem>
                  <SelectItem value="services">Services</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              placeholder="e.g., Mumbai, Maharashtra"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactInfo">Contact Information *</Label>
            <Input
              id="contactInfo"
              placeholder="Phone number or preferred contact method"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Images (Optional)</Label>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" asChild>
                  <label className="cursor-pointer">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Images
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </Button>
                <span className="text-sm text-muted-foreground">
                  {images.length} {images.length === 1 ? 'image' : 'images'} selected
                </span>
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                      <img
                        src={image.getDirectURL()}
                        alt={`Upload ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      {uploadProgress[index] !== undefined && uploadProgress[index] < 100 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white text-sm">{uploadProgress[index]}%</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate({ to: '/browse' })}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createListing.isPending}
              className="flex-1 bg-gradient-to-r from-chart-1 to-chart-4"
            >
              {createListing.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Listing'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
