# Generated by Django 3.2.4 on 2021-06-24 19:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('task', '0002_auto_20210624_2110'),
    ]

    operations = [
        migrations.AlterField(
            model_name='task',
            name='details',
            field=models.CharField(blank=True, max_length=250, null=True),
        ),
    ]
