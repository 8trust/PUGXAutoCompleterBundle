<?php

namespace PUGX\AutocompleterBundle\Form\Transformer;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Component\Form\DataTransformerInterface;
use Symfony\Component\Form\Exception\TransformationFailedException;

class ObjectToIdTransformer implements DataTransformerInterface
{
    /**
     * @var ManagerRegistry
     */
    private $registry;

    /**
     * @var string
     */
    private $class;

    /**
     * @var boolean
     */
    private $isMany2Many;

    /**
     * @param string $class
     */
    public function __construct(ManagerRegistry $registry, $class, $isMany2Many = false)
    {
        $this->registry = $registry;
        $this->class = $class;
        $this->isMany2Many = $isMany2Many;
    }

    /**
     * Transforms an object (object) to a string (id).
     *
     * @param object|null $object
     *
     * @return string
     */
    public function transform($object)
    {
        if (null === $object) {
            return '';
        }
        if ($this->isMany2Many) {
            return implode(',', $object->map(function ($obj) {
                return $obj->getId();
            })->toArray());
        }

        return $object->getId();
    }

    /**
     * Transforms a string (id) to an object (object).
     *
     * @param string|int|null $id
     *
     * @throws TransformationFailedException if object (object) is not found
     *
     * @return object|null|array
     */
    public function reverseTransform($id)
    {
        if (empty($id)) {
            if ($this->isMany2Many) {
                return [];
            }
            return null;
        }
        $ids = false;
        if ($this->isMany2Many) {
            $ids = explode(',', $id);
            $collection = [];
            $objects = $this->registry->getManagerForClass($this->class)->getRepository($this->class)->findBy(['id' => $ids]);

            if (!empty($objects)) {
                $collection = $objects;
            }
            return new ArrayCollection($collection);
        } else {
            $object = $this->registry->getManagerForClass($this->class)->getRepository($this->class)->find($id);
            if (null === $object) {
                $msg = 'Object from class %s with id "%s" not found';
                throw new TransformationFailedException(\sprintf($msg, $this->class, $id));
            }

            return $object;
        }

    }
}
