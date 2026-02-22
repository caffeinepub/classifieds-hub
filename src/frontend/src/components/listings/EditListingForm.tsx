import { useState, useEffect } from 'react';
import { useUpdateListing } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ExternalBlob, Category, type Listing } from '../../backend';
import { formatINRForInput, parseINRInput } from '../../utils/currency';
import { sanitizeInput } from '../../utils/security';

interface EditListingFormProps {
  listing: Listing;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function EditListingForm({ listing, onSuccess, onCancel }: EditListingFormProps) {
  const updateListing = useUpdateListing();

  const [title, setTitle] = useState(listing.title);
  const [description, setDescription] = useState(listing.description);
  const [price, setPrice] = useState(formatINRForInput(listing.price));
  const [category, setCategory] = useState<Category>(listing.category);
  const [location, setLocation] = useState(listing.location);
  const [contactInfo, setContactInfo] = useState(listing.contactInfo);
  const [images, setImages] = useState<ExternalBlob[]>(listing.images);
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Sanitize inputs
    const sanitizedTitle = sanitizeInput(title.trim());
    const sanitizedDescription = sanitizeInput(description.trim());
    const sanitizedLocation = sanitizeInput(location.trim());
    const sanitizedContactInfo = sanitizeInput(contactInfo.trim());

    if (!sanitizedTitle || !sanitizedDescription || !price || !sanitizedLocation || !sanitizedContactInfo) {
      toast.error('Please fill in all required fields');
      return;
    }

    const priceValue = parseINRInput(price);
    if (!priceValue || priceValue < BigInt(0)) {
      toast.error('Please enter a valid price');
      return;
    }

    try {
      await updateListing.mutateAsync({
        listingId: listing.id,
        title: sanitizedTitle,
        description: sanitizedDescription,
        price: priceValue,
        category,
        location: sanitizedLocation,
        images,
        contactInfo: sanitizedContactInfo,
      });

      toast.success('Listing updated successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error updating listing:', error);
      toast.error('Failed to update listing. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="edit-title">Title *</Label>
        <Input
          id="edit-title"
          placeholder="e.g., iPhone 13 Pro Max"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-description">Description *</Label>
        <Textarea
          id="edit-description"
          placeholder="Describe your item in detail..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          required
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="edit-price">Price (INR) *</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
            <Input
              id="edit-price"
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
          <Label htmlFor="edit-category">Category *</Label>
          <Select value={category} onValueChange={(value) => setCategory(value as Category)}>
            <SelectTrigger id="edit-category">
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
        <Label htmlFor="edit-location">Location *</Label>
        <Input
          id="edit-location"
          placeholder="e.g., Mumbai, Maharashtra"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-contactInfo">Contact Information *</Label>
        <Input
          id="edit-contactInfo"
          placeholder="Phone number or preferred contact method"
          value={contactInfo}
          onChange={(e) => setContactInfo(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Images</Label>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" asChild>
              <label className="cursor-pointer">
                <Upload className="mr-2 h-4 w-4" />
                Upload Images
                <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
              </label>
            </Button>
            <span className="text-sm text-muted-foreground">
              {images.length} {images.length === 1 ? 'image' : 'images'}
            </span>
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                  <img src={image.getDirectURL()} alt={`Upload ${index + 1}`} className="h-full w-full object-cover" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" disabled={updateListing.isPending} className="flex-1">
          {updateListing.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            'Update Listing'
          )}
        </Button>
      </div>
    </form>
  );
}
