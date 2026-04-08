import uuid

def create_instance(model):
    data = {}

    for field in model._meta.fields:
        if field.auto_created or field.primary_key:
            continue

        if not field.null and not field.blank:

            # 🔥 UNIQUE alan kontrolü
            if getattr(field, "unique", False):
                if isinstance(field, models.CharField):
                    data[field.name] = str(uuid.uuid4())[:10]
                elif isinstance(field, models.IntegerField):
                    data[field.name] = uuid.uuid4().int % 100000
                continue

            if isinstance(field, models.CharField):
                data[field.name] = "test"
            elif isinstance(field, models.IntegerField):
                data[field.name] = 1
            elif isinstance(field, models.BooleanField):
                data[field.name] = True
            elif isinstance(field, models.ForeignKey):
                data[field.name] = create_instance(field.related_model)

    return model.objects.create(**data)