export const buildProfileFormData = (data, imageFile, jsonFields = []) => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (jsonFields.includes(key)) {
      formData.append(key, JSON.stringify(value));
      return;
    }

    formData.append(key, value);
  });

  if (imageFile) {
    formData.append("profileImageFile", imageFile);
  }

  return formData;
};

export const isValidImageFile = (file) => {
  if (!file) return false;

  return ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(
    file.type,
  );
};
